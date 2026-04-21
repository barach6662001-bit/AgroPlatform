using MediatR;

namespace AgroPlatform.Application.Companies.Commands.DeactivateUser;

/// <summary>Deactivates a user — SuperAdmin only.</summary>
public record DeactivateUserCommand(string UserId) : IRequest;
