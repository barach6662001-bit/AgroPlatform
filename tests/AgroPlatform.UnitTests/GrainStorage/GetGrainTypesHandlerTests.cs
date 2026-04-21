using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainTypes;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.GrainStorage;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace AgroPlatform.UnitTests.GrainStorage;

public class GetGrainTypesHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    private static ICurrentUserService CreateCurrentUserService(Guid tenantId)
    {
        var service = Substitute.For<ICurrentUserService>();
        service.TenantId.Returns(tenantId);
        return service;
    }

    [Fact]
    public async Task Handle_ReturnsDefaultGrainTypes_ForAnyTenant()
    {
        var context = CreateDbContext();
        var tenantId = Guid.NewGuid();

        // Seed default grain types (TenantId = Guid.Empty, IsDefault = true)
        ((TestDbContext)context).GrainTypes.AddRange(
            new GrainType { Name = "Wheat", IsDefault = true, TenantId = Guid.Empty },
            new GrainType { Name = "Corn", IsDefault = true, TenantId = Guid.Empty },
            new GrainType { Name = "Barley", IsDefault = true, TenantId = Guid.Empty }
        );
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserService(tenantId);
        var handler = new GetGrainTypesHandler(context, currentUser);
        var result = await handler.Handle(new GetGrainTypesQuery(), CancellationToken.None);

        result.Should().NotBeEmpty();
        result.Should().Contain("Wheat");
        result.Should().Contain("Corn");
        result.Should().Contain("Barley");
    }

    [Fact]
    public async Task Handle_ReturnsTenantSpecificTypes_AlongsideDefaults()
    {
        var context = CreateDbContext();
        var tenantId = Guid.NewGuid();

        ((TestDbContext)context).GrainTypes.AddRange(
            new GrainType { Name = "Wheat", IsDefault = true, TenantId = Guid.Empty },
            new GrainType { Name = "Custom Crop", IsDefault = false, TenantId = tenantId }
        );
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserService(tenantId);
        var handler = new GetGrainTypesHandler(context, currentUser);
        var result = await handler.Handle(new GetGrainTypesQuery(), CancellationToken.None);

        result.Should().Contain("Wheat");
        result.Should().Contain("Custom Crop");
    }

    [Fact]
    public async Task Handle_ExcludesOtherTenantTypes()
    {
        var context = CreateDbContext();
        var tenantId = Guid.NewGuid();
        var otherTenantId = Guid.NewGuid();

        ((TestDbContext)context).GrainTypes.AddRange(
            new GrainType { Name = "Wheat", IsDefault = true, TenantId = Guid.Empty },
            new GrainType { Name = "Other Crop", IsDefault = false, TenantId = otherTenantId }
        );
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserService(tenantId);
        var handler = new GetGrainTypesHandler(context, currentUser);
        var result = await handler.Handle(new GetGrainTypesQuery(), CancellationToken.None);

        result.Should().Contain("Wheat");
        result.Should().NotContain("Other Crop");
    }

    [Fact]
    public async Task Handle_ExcludesDeletedTypes()
    {
        var context = CreateDbContext();
        var tenantId = Guid.NewGuid();

        ((TestDbContext)context).GrainTypes.AddRange(
            new GrainType { Name = "Wheat", IsDefault = true, TenantId = Guid.Empty },
            new GrainType { Name = "Deleted Crop", IsDefault = true, TenantId = Guid.Empty, IsDeleted = true }
        );
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserService(tenantId);
        var handler = new GetGrainTypesHandler(context, currentUser);
        var result = await handler.Handle(new GetGrainTypesQuery(), CancellationToken.None);

        result.Should().Contain("Wheat");
        result.Should().NotContain("Deleted Crop");
    }

    [Fact]
    public async Task Handle_ReturnsDistinctNames()
    {
        var context = CreateDbContext();
        var tenantId = Guid.NewGuid();

        ((TestDbContext)context).GrainTypes.AddRange(
            new GrainType { Name = "Wheat", IsDefault = true, TenantId = Guid.Empty },
            new GrainType { Name = "Wheat", IsDefault = false, TenantId = tenantId }
        );
        await context.SaveChangesAsync();

        var currentUser = CreateCurrentUserService(tenantId);
        var handler = new GetGrainTypesHandler(context, currentUser);
        var result = await handler.Handle(new GetGrainTypesQuery(), CancellationToken.None);

        result.Should().ContainSingle(x => x == "Wheat");
    }
}
