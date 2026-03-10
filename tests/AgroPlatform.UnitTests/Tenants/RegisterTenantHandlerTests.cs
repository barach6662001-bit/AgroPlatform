using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Tenants.Commands.RegisterTenant;
using AgroPlatform.Domain.Users;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Tenants;

public class RegisterTenantHandlerTests
{
    private static TestDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task RegisterTenant_ValidCommand_ReturnsCreatedTenantDto()
    {
        var context = CreateDbContext();
        var handler = new RegisterTenantHandler(context);
        var command = new RegisterTenantCommand("Agrotech Farm", null);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        result.Name.Should().Be("Agrotech Farm");
        result.Inn.Should().BeNull();
        result.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task RegisterTenant_ValidCommand_PersistsTenantInDatabase()
    {
        var context = CreateDbContext();
        var handler = new RegisterTenantHandler(context);
        var command = new RegisterTenantCommand("Green Fields LLC", "1234567890");

        var result = await handler.Handle(command, CancellationToken.None);

        var tenant = await context.Tenants.FindAsync(result.Id);
        tenant.Should().NotBeNull();
        tenant!.Name.Should().Be("Green Fields LLC");
        tenant.Inn.Should().Be("1234567890");
        tenant.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task RegisterTenant_DuplicateName_ThrowsConflictException()
    {
        var context = CreateDbContext();
        var handler = new RegisterTenantHandler(context);
        context.Tenants.Add(new Tenant { Name = "Existing Farm", IsActive = true });
        await context.SaveChangesAsync();

        var command = new RegisterTenantCommand("Existing Farm", null);

        await handler.Invoking(h => h.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<ConflictException>()
            .WithMessage("*Existing Farm*");
    }

    [Fact]
    public async Task RegisterTenant_DuplicateNameCaseInsensitive_ThrowsConflictException()
    {
        var context = CreateDbContext();
        var handler = new RegisterTenantHandler(context);
        context.Tenants.Add(new Tenant { Name = "MyFarm", IsActive = true });
        await context.SaveChangesAsync();

        var command = new RegisterTenantCommand("myfarm", null);

        await handler.Invoking(h => h.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task RegisterTenant_WithInn_PersistsInn()
    {
        var context = CreateDbContext();
        var handler = new RegisterTenantHandler(context);
        var command = new RegisterTenantCommand("Farm With INN", "9876543210");

        var result = await handler.Handle(command, CancellationToken.None);

        result.Inn.Should().Be("9876543210");
    }

    [Fact]
    public async Task RegisterTenant_NameWithWhitespace_TrimsName()
    {
        var context = CreateDbContext();
        var handler = new RegisterTenantHandler(context);
        var command = new RegisterTenantCommand("  Trimmed Farm  ", null);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Name.Should().Be("Trimmed Farm");
    }

    [Fact]
    public async Task RegisterTenant_NewTenant_IsActiveByDefault()
    {
        var context = CreateDbContext();
        var handler = new RegisterTenantHandler(context);
        var command = new RegisterTenantCommand("Active Farm", null);

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsActive.Should().BeTrue();
    }
}
