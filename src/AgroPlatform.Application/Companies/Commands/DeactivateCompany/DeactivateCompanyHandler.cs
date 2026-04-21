using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Companies.Commands.DeactivateCompany;

public class DeactivateCompanyHandler : IRequestHandler<DeactivateCompanyCommand>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeactivateCompanyHandler(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(DeactivateCompanyCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can deactivate companies.");

        var tenant = await _db.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Company", request.Id);

        tenant.IsActive = false;
        await _db.SaveChangesAsync(cancellationToken);
    }
}
