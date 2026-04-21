using AgroPlatform.Application.Companies.DTOs;
using MediatR;

namespace AgroPlatform.Application.Companies.Commands.CreateCompany;

/// <summary>Creates a new tenant (company) — SuperAdmin only.</summary>
public record CreateCompanyCommand(
    string Name,
    string? CompanyName,
    string? Edrpou,
    string? Address,
    string? Phone
) : IRequest<CompanyListDto>;
