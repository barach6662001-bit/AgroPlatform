using System.Reflection;
using System.Threading.RateLimiting;
using AgroPlatform.Api.Authorization;
using AgroPlatform.Api.Hubs;
using AgroPlatform.Api.Middleware;
using AgroPlatform.Api.OpenApi;
using AgroPlatform.Api.Services;
using AgroPlatform.Application;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Infrastructure;
using AgroPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;
using OpenTelemetry.Metrics;
using Serilog;
using System.Text.Json.Serialization;

// Use CreateLogger() (not CreateBootstrapLogger()) so that multiple WebApplicationFactory
// instances can invoke Program.Main() concurrently in integration tests without triggering
// the "ReloadableLogger is already frozen" exception from Serilog's two-stage init.
// Startup console logs are still captured; UseSerilog() below replaces Log.Logger with
// the fully-configured logger once the DI container is built.
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

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
            Title = "Agrotech API",
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
                Name = "Agrotech",
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
    builder.Services.AddHttpClient();
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddPermissionPolicies();

    // SignalR — real-time fleet hub
    builder.Services.AddSignalR();
    builder.Services.AddScoped<IFleetHubService, FleetHubService>();

    builder.Services.AddHealthChecks()
        .AddDbContextCheck<AppDbContext>(tags: ["ready"]);

    builder.Services.AddOpenTelemetry()
        .WithMetrics(metrics =>
        {
            metrics.AddAspNetCoreInstrumentation()
                   .AddPrometheusExporter();
        });

    builder.Services.AddCors(options =>
    {
        var allowedOrigins = (builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [])
            .Where(o => !string.IsNullOrWhiteSpace(o))
            .ToArray();

        if (allowedOrigins.Length == 0)
        {
            Log.Warning("No CORS allowed origins configured (Cors:AllowedOrigins). Cross-origin browser requests will be blocked.");
        }

        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                  .AllowCredentials(); // Required for SignalR WebSocket/SSE transports
        });
    });

    var rateLimitOptions = builder.Configuration.GetSection("RateLimiting");
    var readPermitLimit = rateLimitOptions.GetValue("ReadPermitLimit", 100);
    var writePermitLimit = rateLimitOptions.GetValue("WritePermitLimit", 30);
    var windowSeconds = rateLimitOptions.GetValue("WindowSeconds", 60);
    var segmentsPerWindow = rateLimitOptions.GetValue("SegmentsPerWindow", 3);

    builder.Services.AddRateLimiter(limiterOptions =>
    {
        // Brute-force protection: 5 login attempts per IP per 15 minutes
        limiterOptions.AddPolicy("auth-login", context =>
            RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? context.Connection.Id,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(15)
                }));

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

    // Auto-apply pending EF Core migrations on startup (controlled by AUTO_MIGRATE env var)
    if (builder.Configuration.GetValue<bool>("AUTO_MIGRATE", false))
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            logger.LogInformation("AUTO_MIGRATE is enabled. Applying pending migrations...");
            await dbContext.Database.MigrateAsync();
            logger.LogInformation("Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while applying database migrations.");
            throw; // Fail fast — don't start the app with an inconsistent database
        }
    }

    // Seeding always runs (idempotent) — seeds grain types + demo user/data on first boot
    await DataSeeder.SeedAsync(app.Services);

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
    app.UseMiddleware<ApiKeyAuthMiddleware>();
    app.UseMiddleware<TenantAuthorizationMiddleware>();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHub<FleetHub>("/hubs/fleet");

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

    app.MapPrometheusScrapingEndpoint();

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
