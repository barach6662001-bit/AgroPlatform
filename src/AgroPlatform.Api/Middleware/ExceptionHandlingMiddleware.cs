using AgroPlatform.Application.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;
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
            ConflictException => (StatusCodes.Status409Conflict, "Conflict", null),
            ForbiddenException => (StatusCodes.Status403Forbidden, "Forbidden", null),
            _ => (StatusCodes.Status500InternalServerError, "An error occurred while processing your request.", null)
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Unhandled exception occurred");

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = statusCode == StatusCodes.Status500InternalServerError ? null : exception.Message
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
