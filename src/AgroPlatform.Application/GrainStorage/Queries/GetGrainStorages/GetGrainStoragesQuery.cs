using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainStorages;

public record GetGrainStoragesQuery(bool? ActiveOnly = null) : IRequest<IReadOnlyList<GrainStorageDto>>;
