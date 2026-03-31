using MediatR;

namespace AgroPlatform.Application.Companies.Commands.DeactivateCompany;

/// <summary>Deactivates a tenant (company) — SuperAdmin only.</summary>
public record DeactivateCompanyCommand(Guid Id) : IRequest;
