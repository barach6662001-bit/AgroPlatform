namespace AgroPlatform.Application.Companies.DTOs;

public record CompanyUserDto(
    string Id,
    string Email,
    string? FirstName,
    string? LastName,
    string Role,
    bool IsActive,
    bool RequirePasswordChange
);
