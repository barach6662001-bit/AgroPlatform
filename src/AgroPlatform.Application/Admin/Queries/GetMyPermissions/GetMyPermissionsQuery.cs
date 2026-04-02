using MediatR;

namespace AgroPlatform.Application.Admin.Queries.GetMyPermissions;

public record GetMyPermissionsQuery : IRequest<MyPermissionsDto>;

public record MyPermissionsDto(string Role, List<string> Permissions);
