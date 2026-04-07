using AgroPlatform.Application.Approval.Services;
using AgroPlatform.Application.Common.Behaviors;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Warehouses.Services;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMemoryCache();

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ConcurrencyRetryBehavior<,>));
        });

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IStockBalanceService, StockBalanceService>();
        services.AddScoped<IUnitConversionService, UnitConversionService>();
        services.AddScoped<IApprovalService, ApprovalService>();

        return services;
    }
}
