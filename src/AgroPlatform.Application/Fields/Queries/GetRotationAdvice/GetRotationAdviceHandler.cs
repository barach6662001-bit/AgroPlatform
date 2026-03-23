using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetRotationAdvice;

public class GetRotationAdviceHandler : IRequestHandler<GetRotationAdviceQuery, List<CropRotationAdviceDto>>
{
    private readonly IAppDbContext _context;

    public GetRotationAdviceHandler(IAppDbContext context) => _context = context;

    public async Task<List<CropRotationAdviceDto>> Handle(GetRotationAdviceQuery request, CancellationToken cancellationToken)
    {
        var currentYear = DateTime.UtcNow.Year;
        var fromYear = currentYear - request.Years;

        var fields = await _context.Fields
            .Include(f => f.CropHistory.Where(h => h.Year >= fromYear))
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);

        return fields.Select(field =>
        {
            var sortedHistory = field.CropHistory
                .OrderByDescending(h => h.Year)
                .ToList();

            var recentCrops = sortedHistory.Select(h => h.Crop).ToList();

            var consecutiveSame = 1;
            for (var i = 1; i < recentCrops.Count; i++)
            {
                if (recentCrops[i] == recentCrops[0])
                    consecutiveSame++;
                else
                    break;
            }

            var riskLevel = recentCrops.Count == 0 ? "None"
                : consecutiveSame >= 3 ? "High"
                : consecutiveSame >= 2 ? "Medium"
                : "None";

            var lastCrop = recentCrops.Count > 0 ? recentCrops[0] : (CropType?)null;
            var suggestedCrop = GetSuggestedCrop(lastCrop, recentCrops);
            var recommendation = BuildRecommendation(lastCrop, riskLevel, consecutiveSame, suggestedCrop, recentCrops.Count);

            return new CropRotationAdviceDto
            {
                FieldId = field.Id,
                FieldName = field.Name,
                AreaHectares = field.AreaHectares,
                RecentCropHistory = sortedHistory.Select(h => new CropYearEntry
                {
                    Year = h.Year,
                    Crop = h.Crop.ToString()
                }).ToList(),
                HasMonocultureRisk = consecutiveSame >= 2,
                RiskLevel = riskLevel,
                Recommendation = recommendation,
                SuggestedCrop = suggestedCrop
            };
        }).ToList();
    }

    private static string? GetSuggestedCrop(CropType? lastCrop, List<CropType> history)
    {
        if (lastCrop == null)
            return null;

        var recentSet = history.Take(2).ToHashSet();

        return lastCrop switch
        {
            CropType.Wheat => recentSet.Contains(CropType.Sunflower) ? "Corn" : "Sunflower",
            CropType.Barley => recentSet.Contains(CropType.Sunflower) ? "Corn" : "Sunflower",
            CropType.Corn => recentSet.Contains(CropType.Soybean) ? "Wheat" : "Soybean",
            CropType.Sunflower => recentSet.Contains(CropType.Wheat) ? "Corn" : "Wheat",
            CropType.Soybean => recentSet.Contains(CropType.Corn) ? "Wheat" : "Corn",
            CropType.Rapeseed => recentSet.Contains(CropType.Wheat) ? "Barley" : "Wheat",
            CropType.SugarBeet => recentSet.Contains(CropType.Wheat) ? "Corn" : "Wheat",
            CropType.Potato => recentSet.Contains(CropType.Wheat) ? "Corn" : "Wheat",
            CropType.Fallow => "Wheat",
            _ => "Wheat"
        };
    }

    private static string BuildRecommendation(CropType? lastCrop, string riskLevel, int consecutiveSame, string? suggestedCrop, int totalHistory)
    {
        if (totalHistory == 0)
            return "No crop history available. Start recording crops to receive rotation advice.";

        var cropName = lastCrop?.ToString() ?? "Unknown";

        return riskLevel switch
        {
            "High" => $"High monoculture risk: {cropName} planted {consecutiveSame} years in a row. Immediate rotation strongly recommended." +
                      (suggestedCrop != null ? $" Consider switching to {suggestedCrop}." : ""),
            "Medium" => $"Moderate risk: {cropName} planted {consecutiveSame} consecutive years. Rotation advised." +
                        (suggestedCrop != null ? $" Suggested next crop: {suggestedCrop}." : ""),
            _ => suggestedCrop != null
                ? $"Rotation looks healthy. For optimal soil health, consider {suggestedCrop} next season."
                : "Crop rotation appears balanced. Continue monitoring."
        };
    }
}
