using AgroPlatform.Application.Companies.DTOs;
using MediatR;

namespace AgroPlatform.Application.Companies.Queries.GetCompanyUsers;

/// <summary>Returns all users belonging to a specific tenant — SuperAdmin only.</summary>
public record GetCompanyUsersQuery(Guid TenantId) : IRequest<List<CompanyUserDto>>;
