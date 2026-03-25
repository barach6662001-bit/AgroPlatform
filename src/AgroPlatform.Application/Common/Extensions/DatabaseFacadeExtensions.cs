using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace AgroPlatform.Application.Common.Extensions;

public static class DatabaseFacadeExtensions
{
    private const string InMemoryProviderName = "Microsoft.EntityFrameworkCore.InMemory";

    public static async Task<IDbContextTransaction?> BeginRepeatableReadTransactionIfSupportedAsync(
        this DatabaseFacade database,
        CancellationToken cancellationToken)
    {
        if (string.Equals(database.ProviderName, InMemoryProviderName, StringComparison.Ordinal))
        {
            return null;
        }

        return await database.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);
    }
}