using MediatR;

namespace AgroPlatform.Application.Companies.Commands.ActivateUser;

/// <summary>Activates a user — SuperAdmin only.</summary>
public record ActivateUserCommand(string UserId) : IRequest;
