using AgroPlatform.Application.Fuel.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fuel.Queries.GetFuelConsumptionComparison;

/// <summary>
/// Compares actual fuel consumption per machine (from FuelTransactions) against configured FuelNorms.
/// Returns rows only for machines that have both fuel issue records and a matching norm.
/// </summary>
public record GetFuelConsumptionComparisonQuery(
    DateTime? DateFrom,
    DateTime? DateTo,
    Guid? FieldId
) : IRequest<IReadOnlyList<FuelConsumptionComparisonDto>>;
