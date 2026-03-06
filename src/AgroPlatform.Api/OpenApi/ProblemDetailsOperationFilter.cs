using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AgroPlatform.Api.OpenApi;

/// <summary>
/// Adds standard ProblemDetails error responses to every Swagger operation:
/// 401 and 403 for endpoints requiring authorization, 400 for write operations (POST/PUT/PATCH),
/// 404 for endpoints with route ID parameters, and 500 for all operations.
/// </summary>
public class ProblemDetailsOperationFilter : IOperationFilter
{
    /// <inheritdoc />
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var problemDetailsSchema = context.SchemaGenerator.GenerateSchema(
            typeof(ProblemDetails),
            context.SchemaRepository);

        var problemDetailsMediaType = new OpenApiMediaType { Schema = problemDetailsSchema };

        // 500 Internal Server Error — applies to all operations
        operation.Responses.TryAdd("500", new OpenApiResponse
        {
            Description = "Internal Server Error",
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["application/problem+json"] = problemDetailsMediaType
            }
        });

        // Check whether the endpoint requires authorization
        var hasAuthorize = context.MethodInfo.DeclaringType!
            .GetCustomAttributes(true)
            .OfType<AuthorizeAttribute>()
            .Any()
            || context.MethodInfo
            .GetCustomAttributes(true)
            .OfType<AuthorizeAttribute>()
            .Any();

        var hasAllowAnonymous = context.MethodInfo.DeclaringType!
            .GetCustomAttributes(true)
            .OfType<AllowAnonymousAttribute>()
            .Any()
            || context.MethodInfo
            .GetCustomAttributes(true)
            .OfType<AllowAnonymousAttribute>()
            .Any();

        if (hasAuthorize && !hasAllowAnonymous)
        {
            operation.Responses.TryAdd("401", new OpenApiResponse
            {
                Description = "Unauthorized — JWT token is missing or invalid",
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["application/problem+json"] = problemDetailsMediaType
                }
            });

            operation.Responses.TryAdd("403", new OpenApiResponse
            {
                Description = "Forbidden — insufficient permissions",
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["application/problem+json"] = problemDetailsMediaType
                }
            });
        }

        // 404 for GET/DELETE endpoints with {id} route parameter
        var httpMethod = context.ApiDescription.HttpMethod ?? string.Empty;
        var hasIdParameter = context.ApiDescription.RelativePath?.Contains("{id") == true
            || context.ApiDescription.RelativePath?.Contains("Id}") == true;

        if (hasIdParameter && (string.Equals(httpMethod, "GET", StringComparison.OrdinalIgnoreCase)
            || string.Equals(httpMethod, "DELETE", StringComparison.OrdinalIgnoreCase)
            || string.Equals(httpMethod, "PUT", StringComparison.OrdinalIgnoreCase)
            || string.Equals(httpMethod, "PATCH", StringComparison.OrdinalIgnoreCase)))
        {
            operation.Responses.TryAdd("404", new OpenApiResponse
            {
                Description = "Not Found",
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["application/problem+json"] = problemDetailsMediaType
                }
            });
        }

        // 400 Bad Request for write operations (POST/PUT/PATCH)
        if (string.Equals(httpMethod, "POST", StringComparison.OrdinalIgnoreCase)
            || string.Equals(httpMethod, "PUT", StringComparison.OrdinalIgnoreCase)
            || string.Equals(httpMethod, "PATCH", StringComparison.OrdinalIgnoreCase))
        {
            operation.Responses.TryAdd("400", new OpenApiResponse
            {
                Description = "Bad Request — validation errors",
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["application/problem+json"] = problemDetailsMediaType
                }
            });
        }
    }
}
