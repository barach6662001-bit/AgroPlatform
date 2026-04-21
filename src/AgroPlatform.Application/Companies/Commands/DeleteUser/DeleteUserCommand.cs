using MediatR;

namespace AgroPlatform.Application.Companies.Commands.DeleteUser;

/// <summary>Permanently deletes a user — SuperAdmin only.</summary>
public record DeleteUserCommand(string UserId) : IRequest;
