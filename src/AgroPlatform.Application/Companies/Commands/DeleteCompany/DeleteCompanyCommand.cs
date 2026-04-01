using MediatR;

namespace AgroPlatform.Application.Companies.Commands.DeleteCompany;

/// <summary>Permanently deletes a company and all its users — SuperAdmin only.</summary>
public record DeleteCompanyCommand(Guid Id) : IRequest;
