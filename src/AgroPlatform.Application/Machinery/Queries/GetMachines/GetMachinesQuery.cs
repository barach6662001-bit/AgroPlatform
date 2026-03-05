using AgroPlatform.Application.Machinery.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Machinery.Queries.GetMachines;

public record GetMachinesQuery(
    MachineryType? Type,
    MachineryStatus? Status,
    string? Search
) : IRequest<List<MachineDto>>;
