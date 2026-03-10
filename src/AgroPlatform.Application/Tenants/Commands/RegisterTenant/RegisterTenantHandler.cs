using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Tenants.DTOs;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Tenants.Commands.RegisterTenant;

public class RegisterTenantHandler : IRequestHandler<RegisterTenantCommand, TenantDto>
{
    private readonly IAppDbContext _db;

    public RegisterTenantHandler(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<TenantDto> Handle(RegisterTenantCommand request, CancellationToken cancellationToken)
    {
        var exists = await _db.Tenants
            .AnyAsync(t => t.Name.ToLower() == request.Name.ToLower(), cancellationToken);

        if (exists)
            throw new ConflictException($"Tenant with name '{request.Name}' already exists.");

        var tenant = new Tenant
        {
            Name = request.Name.Trim(),
            Inn = request.Inn?.Trim(),
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync(cancellationToken);

        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Inn = tenant.Inn,
            IsActive = tenant.IsActive,
            CreatedAtUtc = tenant.CreatedAtUtc
        };
    }
}
