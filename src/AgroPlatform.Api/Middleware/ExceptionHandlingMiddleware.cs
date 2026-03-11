using AgroPlatform.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using ValidationException = AgroPlatform.Application.Common.Exceptions.ValidationException;

namespace AgroPlatform.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, errors) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Not Found", (IDictionary<string, string[]>?)null),
            ValidationException ve => (StatusCodes.Status400BadRequest, "Validation Failed", ve.Errors),
            InsufficientBalanceException => (StatusCodes.Status422UnprocessableEntity, "Insufficient Balance", null),
            ConflictException ce => (StatusCodes.Status409Conflict, ce.Message, null),
            ForbiddenException => (StatusCodes.Status403Forbidden, "Forbidden", null),
            DbUpdateException => (StatusCodes.Status409Conflict, "A record with the same identifier already exists.", null),
            _ => (StatusCodes.Status500InternalServerError, "An error occurred while processing your request.", null)
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            var traceId = context.TraceIdentifier;
            context.Items.TryGetValue("TenantId", out var tenantId);
            _logger.LogError(exception,
                "Unhandled exception occurred. TraceId={TraceId} TenantId={TenantId} Path={Path}",
                traceId, tenantId, context.Request.Path);
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = statusCode == StatusCodes.Status500InternalServerError ? null : exception.Message,
            Instance = context.Request.Path
        };

        if (errors != null)
            problemDetails.Extensions["errors"] = errors;

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
