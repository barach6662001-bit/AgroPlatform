using System.Reflection;
using System.Threading.RateLimiting;
using AgroPlatform.Api.Middleware;
using AgroPlatform.Api.OpenApi;
using AgroPlatform.Application;
using AgroPlatform.Infrastructure;
using AgroPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;
using OpenTelemetry.Metrics;
using Serilog;
using System.Text.Json.Serialization;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) =>
        configuration.ReadFrom.Configuration(context.Configuration));

    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "AgroPlatform API",
            Version = "v1",
            Description = """
                Digital platform for agricultural enterprise management.

                Centralised system for managing fields, warehouses, machinery,
                agro-operations and farm economics. Scales from 1 000 to 5 000+ hectares.

                **Multi-tenancy:** every request must include the `X-Tenant-Id` header
                (UUID of the tenant). Requests without a valid tenant ID will be rejected.

                **Authentication:** obtain a JWT token via `POST /api/auth/login` and
                supply it using the **Authorize** button (Bearer scheme).
                """,
            Contact = new OpenApiContact
            {
                Name = "AgroPlatform",
                Url = new Uri("https://github.com/barach6662001-bit/AgroPlatform")
            },
            License = new OpenApiLicense
            {
                Name = "MIT",
                Url = new Uri("https://opensource.org/licenses/MIT")
            }
        });

        // JWT Bearer security definition
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Name = "Authorization",
            Description = "Enter the JWT token obtained from POST /api/auth/login. " +
                          "Do **not** include the 'Bearer ' prefix — Swagger adds it automatically."
        });

        // Apply Bearer auth globally (endpoints without [AllowAnonymous] require it)
        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });

        // Include XML doc comments generated from C# /// summaries
        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
            options.IncludeXmlComments(xmlPath);

        // Automatically document common ProblemDetails error responses
        options.OperationFilter<ProblemDetailsOperationFilter>();
    });
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    builder.Services.AddHealthChecks()
        .AddDbContextCheck<AppDbContext>(tags: ["ready"]);

    builder.Services.AddOpenTelemetry()
        .WithMetrics(metrics =>
        {
            metrics.AddAspNetCoreInstrumentation();
        });

    builder.Services.AddCors(options =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [];

        if (allowedOrigins.Length == 0)
        {
            Log.Warning("No CORS allowed origins configured (Cors:AllowedOrigins). Cross-origin browser requests will be blocked.");
        }

        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        });
    });

    var rateLimitOptions = builder.Configuration.GetSection("RateLimiting");
    var readPermitLimit = rateLimitOptions.GetValue("ReadPermitLimit", 100);
    var writePermitLimit = rateLimitOptions.GetValue("WritePermitLimit", 30);
    var windowSeconds = rateLimitOptions.GetValue("WindowSeconds", 60);
    var segmentsPerWindow = rateLimitOptions.GetValue("SegmentsPerWindow", 3);

    builder.Services.AddRateLimiter(limiterOptions =>
    {
        limiterOptions.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? context.Connection.Id;
            var method = context.Request.Method;

            if (HttpMethods.IsPost(method) || HttpMethods.IsPut(method) ||
                HttpMethods.IsPatch(method) || HttpMethods.IsDelete(method))
            {
                return RateLimitPartition.GetSlidingWindowLimiter(
                    $"writes_{ip}",
                    _ => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = writePermitLimit,
                        Window = TimeSpan.FromSeconds(windowSeconds),
                        SegmentsPerWindow = segmentsPerWindow
                    });
            }

            return RateLimitPartition.GetSlidingWindowLimiter(
                $"reads_{ip}",
                _ => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = readPermitLimit,
                    Window = TimeSpan.FromSeconds(windowSeconds),
                    SegmentsPerWindow = segmentsPerWindow
                });
        });

        limiterOptions.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    });

    var app = builder.Build();

    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseMiddleware<SecurityHeadersMiddleware>();

    app.UseSerilogRequestLogging(options =>
    {
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("TraceId", httpContext.TraceIdentifier);
            diagnosticContext.Set("RequestPath", httpContext.Request.Path);
            if (httpContext.Items.TryGetValue("TenantId", out var tenantId) && tenantId is not null)
                diagnosticContext.Set("TenantId", tenantId);
        };
    });

    // Swagger is enabled in Development by default; set Swagger:Enabled=true to enable in other environments.
    var swaggerEnabled = builder.Configuration.GetValue<bool?>("Swagger:Enabled")
        ?? builder.Environment.IsDevelopment();

    if (swaggerEnabled)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "AgroPlatform API v1");
            options.DocumentTitle = "AgroPlatform API";
        });
    }

    app.UseCors();
    app.UseHttpsRedirection();
    app.UseRateLimiter();
    app.UseMiddleware<TenantMiddleware>();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    var healthCheckStatusCodes = new Dictionary<HealthStatus, int>
    {
        [HealthStatus.Healthy] = StatusCodes.Status200OK,
        [HealthStatus.Degraded] = StatusCodes.Status200OK,
        [HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable
    };

    app.MapHealthChecks("/health/live", new HealthCheckOptions
    {
        Predicate = _ => false,
        ResultStatusCodes = healthCheckStatusCodes
    });

    app.MapHealthChecks("/health/ready", new HealthCheckOptions
    {
        Predicate = check => check.Tags.Contains("ready"),
        ResultStatusCodes = healthCheckStatusCodes
    });

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
