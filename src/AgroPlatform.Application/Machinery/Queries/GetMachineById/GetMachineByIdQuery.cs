using AgroPlatform.Application.Machinery.DTOs;
using MediatR;

namespace AgroPlatform.Application.Machinery.Queries.GetMachineById;

public record GetMachineByIdQuery(Guid Id) : IRequest<MachineDetailDto?>;
