using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetPrescriptionMap;

/// <summary>Generates a variable-rate prescription map for a field.</summary>
/// <param name="FieldId">The field to generate the map for.</param>
/// <param name="Nutrient">Target nutrient: Nitrogen, Phosphorus, or Potassium.</param>
/// <param name="NdviDate">Optional NDVI snapshot date for context (yyyy-MM-dd).</param>
public record GetPrescriptionMapQuery(
    Guid FieldId,
    string Nutrient = "Nitrogen",
    string? NdviDate = null
) : IRequest<PrescriptionMapDto>;
