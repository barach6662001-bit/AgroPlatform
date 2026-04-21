using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Machinery.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Machinery.Queries.GetMachines;

public record GetMachinesQuery(
    MachineryType? Type,
    MachineryStatus? Status,
    string? Search,
    int Page = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<MachineDto>>;
