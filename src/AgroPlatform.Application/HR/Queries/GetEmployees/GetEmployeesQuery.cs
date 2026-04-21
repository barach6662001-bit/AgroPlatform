using AgroPlatform.Application.HR.DTOs;
using MediatR;

namespace AgroPlatform.Application.HR.Queries.GetEmployees;

public record GetEmployeesQuery(bool? ActiveOnly) : IRequest<List<EmployeeDto>>;
