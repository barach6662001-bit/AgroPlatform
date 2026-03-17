using MediatR;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainTypes;

public record GetGrainTypesQuery : IRequest<IReadOnlyList<string>>;
