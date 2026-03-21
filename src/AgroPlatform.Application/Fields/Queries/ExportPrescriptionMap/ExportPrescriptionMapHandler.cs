using System.Text;
using AgroPlatform.Application.Economics.Queries.ExportCostRecords;
using AgroPlatform.Application.Fields.Queries.GetPrescriptionMap;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.ExportPrescriptionMap;

public class ExportPrescriptionMapHandler : IRequestHandler<ExportPrescriptionMapQuery, ExportResult>
{
    private readonly IMediator _mediator;

    public ExportPrescriptionMapHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<ExportResult> Handle(ExportPrescriptionMapQuery request, CancellationToken cancellationToken)
    {
        var map = await _mediator.Send(
            new GetPrescriptionMapQuery(request.FieldId, request.Nutrient, request.NdviDate),
            cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine($"Field,{Escape(map.FieldName)}");
        sb.AppendLine($"Nutrient,{map.Nutrient}");
        if (!string.IsNullOrEmpty(map.NdviDate))
            sb.AppendLine($"NDVI Date,{map.NdviDate}");
        sb.AppendLine($"Generated,{DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
        sb.AppendLine();
        sb.AppendLine("Zone,Rate Class,Rate (kg/ha),N (mg/kg),P (mg/kg),K (mg/kg),pH,Humus (%),Sample Date");

        foreach (var z in map.Zones)
        {
            sb.AppendLine(string.Join(",",
                Escape(z.ZoneName),
                Escape(z.RateClass),
                z.RecommendedRateKgPerHa.ToString("F1"),
                z.SoilNitrogen?.ToString("F1") ?? "",
                z.SoilPhosphorus?.ToString("F1") ?? "",
                z.SoilPotassium?.ToString("F1") ?? "",
                z.SoilPH?.ToString("F2") ?? "",
                z.SoilHumus?.ToString("F2") ?? "",
                z.SampleDate?.ToString("yyyy-MM-dd") ?? ""
            ));
        }

        var bytes = Encoding.UTF8.GetPreamble()
            .Concat(Encoding.UTF8.GetBytes(sb.ToString()))
            .ToArray();

        var nutrientSlug = map.Nutrient.ToLowerInvariant();
        var fileName = $"prescription-map-{map.FieldId:N}-{nutrientSlug}-{DateTime.UtcNow:yyyyMMdd}.csv";
        return new ExportResult(bytes, "text/csv", fileName);
    }

    private static string Escape(string value) =>
        value.Contains(',') || value.Contains('"')
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value;
}
