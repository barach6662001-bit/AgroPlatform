using AgroPlatform.Application.HR.DTOs;
using MediatR;

namespace AgroPlatform.Application.HR.Queries.GetWorkLogs;

public record GetWorkLogsQuery(Guid? EmployeeId, int? Month, int? Year) : IRequest<List<WorkLogDto>>;
