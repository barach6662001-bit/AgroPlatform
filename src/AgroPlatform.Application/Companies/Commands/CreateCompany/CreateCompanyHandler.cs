using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Companies.DTOs;
using AgroPlatform.Domain.FeatureFlags;
using AgroPlatform.Domain.Users;
using MediatR;

namespace AgroPlatform.Application.Companies.Commands.CreateCompany;

public class CreateCompanyHandler : IRequestHandler<CreateCompanyCommand, CompanyListDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateCompanyHandler(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<CompanyListDto> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can create companies.");

        var tenant = new Tenant
        {
            Id          = Guid.NewGuid(),
            Name        = request.Name,
            CompanyName = request.CompanyName,
            Edrpou      = request.Edrpou,
            Address     = request.Address,
            Phone       = request.Phone,
            IsActive    = true,
            CreatedAtUtc = DateTime.UtcNow,
        };

        _db.Tenants.Add(tenant);

        _db.TenantFeatureFlags.AddRange(OptionalFeatureFlagKeys.All.Select(key => new TenantFeatureFlag
        {
            TenantId = tenant.Id,
            Key = key,
            IsEnabled = false,
        }));

        await _db.SaveChangesAsync(cancellationToken);

        return new CompanyListDto(
            tenant.Id, tenant.Name, tenant.CompanyName,
            tenant.Edrpou, tenant.Address, tenant.Phone,
            tenant.IsActive, 0, tenant.CreatedAtUtc);
    }
}
