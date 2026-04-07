using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that retries the handler up to 3 times when
/// a <see cref="DbUpdateConcurrencyException"/> is thrown (optimistic concurrency conflict).
/// </summary>
public class ConcurrencyRetryBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private const int MaxRetries = 3;
    private readonly ILogger<ConcurrencyRetryBehavior<TRequest, TResponse>> _logger;

    public ConcurrencyRetryBehavior(ILogger<ConcurrencyRetryBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        for (int attempt = 1; ; attempt++)
        {
            try
            {
                return await next();
            }
            catch (DbUpdateConcurrencyException ex) when (attempt < MaxRetries)
            {
                _logger.LogWarning(
                    ex,
                    "Concurrency conflict on {RequestType}, retry {Attempt}/{Max}",
                    typeof(TRequest).Name, attempt, MaxRetries);

                // Brief delay with exponential backoff before retry
                await Task.Delay(attempt * 50, cancellationToken);
            }
        }
    }
}
