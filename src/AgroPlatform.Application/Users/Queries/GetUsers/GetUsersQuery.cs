using MediatR;

namespace AgroPlatform.Application.Users.Queries.GetUsers;

public record GetUsersQuery : IRequest<List<UserListDto>>;
