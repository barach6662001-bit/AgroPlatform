using MediatR;

namespace AgroPlatform.Application.Fields.Commands.ReportNdviProblems;

public record ReportNdviProblemsCommand(Guid FieldId, int ProblemZoneCount) : IRequest;
