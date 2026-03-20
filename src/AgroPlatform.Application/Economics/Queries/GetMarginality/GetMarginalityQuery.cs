using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetMarginality;

public record GetMarginalityQuery(
    int? Year,
    decimal? EstimatedPricePerTonne
) : IRequest<IReadOnlyList<MarginalityItemDto>>;
