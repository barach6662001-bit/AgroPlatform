using AgroPlatform.Application.Auth.Commands.Login;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Users.Commands.UpdateUserRole;
using AgroPlatform.Application.Users.Queries.GetUsers;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Users;
using AgroPlatform.UnitTests.TestDoubles;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace AgroPlatform.UnitTests.Users;

public class UserHandlerTests
{
    private static UserManager<AppUser> CreateUserManager()
    {
        var store = Substitute.For<IUserStore<AppUser>>();
        return Substitute.For<UserManager<AppUser>>(
            store, null, null, null, null, null, null, null, null);
    }

    // ── UpdateUserRole ────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateUserRole_ValidUserId_UpdatesRoleInDatabase()
    {
        var tenantId = Guid.NewGuid();
        var user = new AppUser
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = tenantId,
            Role = UserRole.Agronomist,
        };
        var currentUser = new FakeCurrentUserService { TenantId = tenantId };

        var userManager = CreateUserManager();
        userManager.FindByIdAsync(user.Id).Returns(user);
        userManager.UpdateAsync(Arg.Any<AppUser>()).Returns(IdentityResult.Success);

        var handler = new UpdateUserRoleHandler(userManager, currentUser);
        await handler.Handle(new UpdateUserRoleCommand(user.Id, "Manager"), CancellationToken.None);

        user.Role.Should().Be(UserRole.Manager);
        await userManager.Received(1).UpdateAsync(user);
    }

    [Fact]
    public async Task UpdateUserRole_UserNotFound_ThrowsNotFoundException()
    {
        var userManager = CreateUserManager();
        var currentUser = new FakeCurrentUserService();
        userManager.FindByIdAsync(Arg.Any<string>()).Returns((AppUser?)null);

        var handler = new UpdateUserRoleHandler(userManager, currentUser);
        var act = async () =>
            await handler.Handle(new UpdateUserRoleCommand("non-existent-id", "Manager"), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── GetUsers ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetUsers_ReturnsAllUsersInTenant()
    {
        var tenantId = Guid.NewGuid();
        var otherTenantId = Guid.NewGuid();
        var currentUser = new FakeCurrentUserService { TenantId = tenantId };

        var users = new List<AppUser>
        {
            new AppUser { Id = Guid.NewGuid().ToString(), TenantId = tenantId, FirstName = "Alice", LastName = "Smith", Role = UserRole.Manager, IsActive = true, Email = "alice@test.com" },
            new AppUser { Id = Guid.NewGuid().ToString(), TenantId = tenantId, FirstName = "Bob", LastName = "Jones", Role = UserRole.Agronomist, IsActive = true, Email = "bob@test.com" },
            new AppUser { Id = Guid.NewGuid().ToString(), TenantId = otherTenantId, FirstName = "Charlie", LastName = "Brown", Role = UserRole.Director, IsActive = true, Email = "charlie@test.com" },
        };

        var userManager = CreateUserManager();
        userManager.Users.Returns(new TestAsyncEnumerable<AppUser>(users));

        var handler = new GetUsersHandler(userManager, currentUser);
        var result = await handler.Handle(new GetUsersQuery(), CancellationToken.None);

        result.Should().HaveCount(2);
        result.Should().AllSatisfy(u => u.Email.Should().NotBeEmpty());
    }

    [Fact]
    public async Task GetUsers_EmptyDatabase_ReturnsEmptyList()
    {
        var currentUser = new FakeCurrentUserService { TenantId = Guid.NewGuid() };

        var userManager = CreateUserManager();
        userManager.Users.Returns(new TestAsyncEnumerable<AppUser>(new List<AppUser>()));

        var handler = new GetUsersHandler(userManager, currentUser);
        var result = await handler.Handle(new GetUsersQuery(), CancellationToken.None);

        result.Should().BeEmpty();
    }

    // ── Login ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task Login_InactiveUser_ThrowsUnauthorizedException()
    {
        var userManager = CreateUserManager();
        var jwtService = Substitute.For<IJwtTokenService>();

        var user = new AppUser
        {
            Id = Guid.NewGuid().ToString(),
            Email = "inactive@test.com",
            TenantId = Guid.NewGuid(),
            IsActive = false,
            Role = UserRole.Agronomist,
        };

        userManager.FindByEmailAsync(user.Email).Returns(user);
        userManager.CheckPasswordAsync(user, "password123").Returns(true);

        var handler = new LoginHandler(userManager, jwtService);
        var act = async () =>
            await handler.Handle(new LoginCommand(user.Email, "password123"), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedException>();
        jwtService.DidNotReceive().GenerateToken(Arg.Any<AppUser>());
    }

    // ── Permission Policy Matrix ──────────────────────────────────────────

    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task PermissionEntity_CanStoreAndRetrieve()
    {
        var context = CreateDbContext();
        var roleId = Guid.NewGuid();

        context.Permissions.Add(new Permission
        {
            RoleId = roleId,
            Module = "Economics",
            CanRead = true,
            CanCreate = true,
            CanUpdate = true,
            CanDelete = true,
        });
        await context.SaveChangesAsync();

        var result = await ((TestDbContext)context).Permissions
            .Where(p => p.RoleId == roleId)
            .ToListAsync();

        result.Should().HaveCount(1);
        var perm = result[0];
        perm.Module.Should().Be("Economics");
        perm.CanRead.Should().BeTrue();
        perm.CanCreate.Should().BeTrue();
    }

    [Fact]
    public async Task PermissionEntity_FiltersByRoleId()
    {
        var context = CreateDbContext();
        var adminRoleId = Guid.NewGuid();
        var operatorRoleId = Guid.NewGuid();

        context.Permissions.Add(new Permission
        {
            RoleId = adminRoleId,
            Module = "HR",
            CanRead = true,
            CanCreate = true,
            CanUpdate = true,
            CanDelete = true,
        });
        context.Permissions.Add(new Permission
        {
            RoleId = operatorRoleId,
            Module = "HR",
            CanRead = true,
            CanCreate = false,
            CanUpdate = false,
            CanDelete = false,
        });
        await context.SaveChangesAsync();

        var adminPerms = await ((TestDbContext)context).Permissions
            .Where(p => p.RoleId == adminRoleId).ToListAsync();
        var operatorPerms = await ((TestDbContext)context).Permissions
            .Where(p => p.RoleId == operatorRoleId).ToListAsync();

        adminPerms.Should().HaveCount(1).And.AllSatisfy(p => p.CanDelete.Should().BeTrue());
        operatorPerms.Should().HaveCount(1).And.AllSatisfy(p => p.CanDelete.Should().BeFalse());
    }
}
