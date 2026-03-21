using MediatR;
using AgroPlatform.Application.Economics.Queries.ExportCostRecords;

namespace AgroPlatform.Application.Fields.Queries.ExportPrescriptionMap;

/// <summary>Exports a variable-rate prescription map as CSV for use with precision agriculture equipment.</summary>
public record ExportPrescriptionMapQuery(
    Guid FieldId,
    string Nutrient = "Nitrogen",
    string? NdviDate = null
) : IRequest<ExportResult>;
