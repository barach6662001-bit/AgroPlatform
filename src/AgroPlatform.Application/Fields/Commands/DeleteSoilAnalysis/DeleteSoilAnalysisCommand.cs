using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteSoilAnalysis;

public record DeleteSoilAnalysisCommand(Guid Id) : IRequest;
