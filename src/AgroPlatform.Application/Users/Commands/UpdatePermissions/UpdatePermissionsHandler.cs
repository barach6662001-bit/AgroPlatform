using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Users.Commands.UpdatePermissions;

public class UpdatePermissionsHandler : IRequestHandler<UpdatePermissionsCommand, Unit>
{
    private readonly IAppDbContext _context;

    public UpdatePermissionsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdatePermissionsCommand request, CancellationToken cancellationToken)
    {
        var permissions = await _context.Permissions
            .Where(p => p.RoleId == request.RoleId && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        foreach (var updateDto in request.Permissions)
        {
            var permission = permissions.FirstOrDefault(p => p.Id == updateDto.PermissionId);
            if (permission != null)
            {
                permission.CanRead = updateDto.CanRead;
                permission.CanCreate = updateDto.CanCreate;
                permission.CanUpdate = updateDto.CanUpdate;
                permission.CanDelete = updateDto.CanDelete;
                permission.Notes = updateDto.Notes;
                permission.LastReviewedAtUtc = DateTime.UtcNow;
            }
        }

        _context.Permissions.UpdateRange(permissions);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
