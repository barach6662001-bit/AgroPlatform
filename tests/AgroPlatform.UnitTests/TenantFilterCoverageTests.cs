using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Common;
using AgroPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace AgroPlatform.UnitTests;

public class TenantFilterCoverageTests
{
    [Fact]
    public void AllTenantEntities_Have_QueryFilter_Registered()
    {
        // Arrange — build an EF model from AppDbContext
        var tenantService = Substitute.For<ITenantService>();
        tenantService.GetTenantId().Returns(Guid.NewGuid());

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new AppDbContext(options, tenantService);
        var model = context.Model;

        // Collect all Domain types implementing ITenantEntity
        var domainAssembly = typeof(ITenantEntity).Assembly;
        var tenantEntityTypes = domainAssembly.GetTypes()
            .Where(t => t is { IsAbstract: false, IsInterface: false }
                        && typeof(ITenantEntity).IsAssignableFrom(t))
            .ToHashSet();

        // AuditEntry has TenantId but does not implement ITenantEntity
        tenantEntityTypes.Add(typeof(AuditEntry));

        // Act — check each entity has a query filter
        var missingFilters = new List<string>();
        foreach (var type in tenantEntityTypes)
        {
            var entityType = model.FindEntityType(type);
            if (entityType == null)
                continue; // Not mapped in EF — skip

            var queryFilter = entityType.GetQueryFilter();
            if (queryFilter == null)
                missingFilters.Add(type.Name);
        }

        // Assert
        Assert.Empty(missingFilters);
    }

    [Fact]
    public void GlobalEntities_Have_No_TenantFilter()
    {
        // Arrange
        var tenantService = Substitute.For<ITenantService>();
        tenantService.GetTenantId().Returns(Guid.NewGuid());

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new AppDbContext(options, tenantService);
        var model = context.Model;

        var globalTypes = new[]
        {
            typeof(AgroPlatform.Domain.Warehouses.UnitOfMeasure),
            typeof(AgroPlatform.Domain.Warehouses.UnitConversionRule),
            typeof(AgroPlatform.Domain.Authorization.RolePermission),
        };

        // Act & Assert — global entities must NOT have query filters
        foreach (var type in globalTypes)
        {
            var entityType = model.FindEntityType(type);
            Assert.NotNull(entityType);
            Assert.Null(entityType!.GetQueryFilter());
        }
    }
}
