using AgroPlatform.Application.Companies.DTOs;
using MediatR;

namespace AgroPlatform.Application.Companies.Queries.GetCompanies;

/// <summary>Returns all tenants (companies) — SuperAdmin only.</summary>
public record GetCompaniesQuery : IRequest<List<CompanyListDto>>;
