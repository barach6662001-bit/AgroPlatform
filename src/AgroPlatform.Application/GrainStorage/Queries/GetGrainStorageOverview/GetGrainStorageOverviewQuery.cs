using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainStorageOverview;

/// <summary>
/// Returns an aggregated overview of all grain storages including occupancy,
/// batches, grain types, and potential warnings.
/// </summary>
/// <param name="ActiveOnly">When true, only active storages are returned.</param>
/// <param name="StorageId">When set, returns overview for that specific storage only.</param>
public record GetGrainStorageOverviewQuery(
    bool? ActiveOnly = null,
    Guid? StorageId = null
) : IRequest<IReadOnlyList<GrainStorageOverviewDto>>;
