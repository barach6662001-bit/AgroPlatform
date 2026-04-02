using MediatR;

namespace AgroPlatform.Application.Companies.Commands.ResetUserPassword;

/// <summary>Resets a user's password (admin action). Sets RequirePasswordChange = true.</summary>
public record ResetUserPasswordCommand(
    string UserId,
    string NewPassword
) : IRequest;
