using AgroPlatform.Application.Companies.DTOs;
using MediatR;

namespace AgroPlatform.Application.Companies.Commands.CreateUser;

/// <summary>Creates a new user in a tenant — SuperAdmin only. Sets RequirePasswordChange = true.</summary>
public record CreateUserCommand(
    Guid TenantId,
    string Email,
    string Password,
    string? FirstName,
    string? LastName,
    string Role
) : IRequest<CompanyUserDto>;
