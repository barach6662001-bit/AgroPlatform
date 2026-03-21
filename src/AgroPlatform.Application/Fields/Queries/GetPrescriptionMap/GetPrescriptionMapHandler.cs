using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetPrescriptionMap;

public class GetPrescriptionMapHandler : IRequestHandler<GetPrescriptionMapQuery, PrescriptionMapDto>
{
    private readonly IAppDbContext _context;

    public GetPrescriptionMapHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PrescriptionMapDto> Handle(GetPrescriptionMapQuery request, CancellationToken cancellationToken)
    {
        var field = await _context.Fields
            .Where(f => f.Id == request.FieldId)
            .Select(f => new { f.Id, f.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (field is null)
            return new PrescriptionMapDto { FieldId = request.FieldId };

        // Fetch all zones for the field
        var zones = await _context.FieldZones
            .Where(z => z.FieldId == request.FieldId)
            .Select(z => new { z.Id, z.Name })
            .ToListAsync(cancellationToken);

        // Fetch latest soil analysis per zone (or field-level if ZoneId is null)
        var analyses = await _context.SoilAnalyses
            .Where(s => s.FieldId == request.FieldId)
            .OrderByDescending(s => s.SampleDate)
            .Select(s => new
            {
                s.Id,
                s.ZoneId,
                s.SampleDate,
                s.pH,
                s.Nitrogen,
                s.Phosphorus,
                s.Potassium,
                s.Humus,
            })
            .ToListAsync(cancellationToken);

        // Take the most recent analysis per ZoneId key (use string representation of nullable Guid)
        var latestByZone = analyses
            .GroupBy(a => a.ZoneId?.ToString() ?? "null")
            .ToDictionary(g => g.Key, g => g.First());

        var nutrient = NormalizeNutrient(request.Nutrient);

        List<PrescriptionZoneDto> prescriptionZones;

        if (zones.Count > 0)
        {
            // Build one prescription entry per field zone
            prescriptionZones = zones.Select(z =>
            {
                latestByZone.TryGetValue(z.Id.ToString(), out var analysis);
                var value = GetNutrientValue(nutrient, analysis?.Nitrogen, analysis?.Phosphorus, analysis?.Potassium);
                var (rateClass, rate) = ComputeRate(nutrient, value);
                return new PrescriptionZoneDto
                {
                    ZoneId = z.Id,
                    ZoneName = z.Name,
                    RateClass = rateClass,
                    RecommendedRateKgPerHa = rate,
                    SoilNitrogen = analysis?.Nitrogen,
                    SoilPhosphorus = analysis?.Phosphorus,
                    SoilPotassium = analysis?.Potassium,
                    SoilPH = analysis?.pH,
                    SoilHumus = analysis?.Humus,
                    SampleDate = analysis?.SampleDate,
                    Nutrient = nutrient,
                };
            }).ToList();
        }
        else if (latestByZone.Count > 0)
        {
            // No FieldZones defined — use field-level soil analyses (ZoneId = null and any)
            prescriptionZones = latestByZone.Values.Select((analysis, idx) =>
            {
                var value = GetNutrientValue(nutrient, analysis.Nitrogen, analysis.Phosphorus, analysis.Potassium);
                var (rateClass, rate) = ComputeRate(nutrient, value);
                return new PrescriptionZoneDto
                {
                    ZoneId = analysis.ZoneId,
                    ZoneName = analysis.ZoneId.HasValue ? $"Zone {idx + 1}" : "Field",
                    RateClass = rateClass,
                    RecommendedRateKgPerHa = rate,
                    SoilNitrogen = analysis.Nitrogen,
                    SoilPhosphorus = analysis.Phosphorus,
                    SoilPotassium = analysis.Potassium,
                    SoilPH = analysis.pH,
                    SoilHumus = analysis.Humus,
                    SampleDate = analysis.SampleDate,
                    Nutrient = nutrient,
                };
            }).ToList();
        }
        else
        {
            // No soil analyses available — return a default single-zone entry
            var (rateClass, rate) = ComputeRate(nutrient, null);
            prescriptionZones =
            [
                new PrescriptionZoneDto
                {
                    ZoneName = "Field",
                    RateClass = rateClass,
                    RecommendedRateKgPerHa = rate,
                    Nutrient = nutrient,
                }
            ];
        }

        return new PrescriptionMapDto
        {
            FieldId = field.Id,
            FieldName = field.Name,
            Nutrient = nutrient,
            NdviDate = request.NdviDate,
            Zones = prescriptionZones,
        };
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static string NormalizeNutrient(string nutrient) =>
        nutrient.ToLowerInvariant() switch
        {
            "phosphorus" or "p" => "Phosphorus",
            "potassium" or "k" => "Potassium",
            _ => "Nitrogen",
        };

    private static decimal? GetNutrientValue(string nutrient, decimal? n, decimal? p, decimal? k) =>
        nutrient switch
        {
            "Phosphorus" => p,
            "Potassium" => k,
            _ => n,
        };

    /// <summary>
    /// Simple three-zone prescription rule:
    ///   N: low &lt;50 → 120 kg/ha (A), 50-100 → 80 kg/ha (B), &gt;100 → 40 kg/ha (C)
    ///   P: low &lt;40 → 90 kg/ha (A), 40-80  → 60 kg/ha (B), &gt;80  → 30 kg/ha (C)
    ///   K: low &lt;80 → 100 kg/ha (A), 80-150 → 70 kg/ha (B), &gt;150 → 35 kg/ha (C)
    /// When value is unknown, return the mid-range "B" rate.
    /// </summary>
    private static (string rateClass, decimal rateKgPerHa) ComputeRate(string nutrient, decimal? value)
    {
        if (value is null)
            return nutrient switch
            {
                "Phosphorus" => ("B", 60m),
                "Potassium" => ("B", 70m),
                _ => ("B", 80m),
            };

        return nutrient switch
        {
            "Phosphorus" => value < 40 ? ("A", 90m) : value <= 80 ? ("B", 60m) : ("C", 30m),
            "Potassium" => value < 80 ? ("A", 100m) : value <= 150 ? ("B", 70m) : ("C", 35m),
            _ => value < 50 ? ("A", 120m) : value <= 100 ? ("B", 80m) : ("C", 40m),
        };
    }
}
