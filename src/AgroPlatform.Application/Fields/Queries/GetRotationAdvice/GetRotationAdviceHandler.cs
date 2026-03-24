using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetRotationAdvice;

public class GetRotationAdviceHandler : IRequestHandler<GetRotationAdviceQuery, List<RotationAdviceDto>>
{
    private readonly IAppDbContext _context;

    public GetRotationAdviceHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<RotationAdviceDto>> Handle(GetRotationAdviceQuery request, CancellationToken cancellationToken)
    {
        var minYear = DateTime.UtcNow.Year - request.Years + 1;

        var fields = await _context.Fields
            .Select(f => new { f.Id, f.Name })
            .ToListAsync(cancellationToken);

        var seedings = await _context.FieldSeedings
            .Where(s => s.Year >= minYear)
            .Select(s => new { s.FieldId, s.Year, s.CropName })
            .ToListAsync(cancellationToken);

        var result = new List<RotationAdviceDto>();

        foreach (var field in fields)
        {
            var history = seedings
                .Where(s => s.FieldId == field.Id)
                .OrderBy(s => s.Year)
                .Select(s => s.CropName)
                .ToList();

            var (riskLevel, recommendation) = AnalyzeRotation(history);

            result.Add(new RotationAdviceDto
            {
                FieldId = field.Id,
                FieldName = field.Name,
                CropHistory = history,
                RiskLevel = riskLevel,
                Recommendation = recommendation,
            });
        }

        return result;
    }

    private static (string riskLevel, string recommendation) AnalyzeRotation(List<string> history)
    {
        if (history.Count == 0)
            return ("low", "No seeding history available. Start recording seedings to receive rotation advice.");

        // Check for consecutive repetitions of the same crop
        int maxConsecutive = 1;
        int current = 1;
        for (int i = 1; i < history.Count; i++)
        {
            if (string.Equals(history[i], history[i - 1], StringComparison.OrdinalIgnoreCase))
                current++;
            else
                current = 1;

            if (current > maxConsecutive)
                maxConsecutive = current;
        }

        if (maxConsecutive >= 3)
            return ("high", $"Monoculture detected: '{history[^1]}' grown for {maxConsecutive} consecutive years. Rotate to a legume or a different crop family immediately to restore soil health.");

        if (maxConsecutive == 2)
            return ("medium", $"'{history[^1]}' was repeated consecutively. Consider introducing a different crop next season to reduce disease pressure and improve soil structure.");

        return ("low", "Good crop rotation detected. Continue varying crops each season to maintain soil fertility and reduce pest buildup.");
    }
}
