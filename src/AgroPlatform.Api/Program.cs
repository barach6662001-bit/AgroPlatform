using System.Threading.RateLimiting;
using AgroPlatform.Api.Middleware;
using AgroPlatform.Application;
using AgroPlatform.Infrastructure;
using AgroPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Diagnostics.HealthChecks;
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
    builder.Services.AddSwaggerGen();
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

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
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
