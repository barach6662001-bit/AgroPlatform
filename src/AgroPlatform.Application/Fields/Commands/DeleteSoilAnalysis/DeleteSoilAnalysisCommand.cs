using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteSoilAnalysis;

public record DeleteSoilAnalysisCommand(Guid FieldId, Guid Id) : IRequest;
