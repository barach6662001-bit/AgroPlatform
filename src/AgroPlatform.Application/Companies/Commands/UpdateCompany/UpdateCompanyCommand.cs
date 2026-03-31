using MediatR;

namespace AgroPlatform.Application.Companies.Commands.UpdateCompany;

/// <summary>Updates a tenant's details — SuperAdmin only.</summary>
public record UpdateCompanyCommand(
    Guid Id,
    string Name,
    string? CompanyName,
    string? Edrpou,
    string? Address,
    string? Phone
) : IRequest;
