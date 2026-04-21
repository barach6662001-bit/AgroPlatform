using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Admin.Queries.GetAvailableRoles;

public record GetAvailableRolesQuery : IRequest<List<string>>;

public class GetAvailableRolesHandler : IRequestHandler<GetAvailableRolesQuery, List<string>>
{
    public Task<List<string>> Handle(GetAvailableRolesQuery request, CancellationToken cancellationToken)
    {
        var roles = Enum.GetNames<UserRole>().ToList();
        return Task.FromResult(roles);
    }
}
