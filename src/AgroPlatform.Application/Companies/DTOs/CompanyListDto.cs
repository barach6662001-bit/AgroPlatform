namespace AgroPlatform.Application.Companies.DTOs;

public record CompanyListDto(
    Guid Id,
    string Name,
    string? CompanyName,
    string? Edrpou,
    string? Address,
    string? Phone,
    bool IsActive,
    int UserCount,
    DateTime CreatedAtUtc
);
