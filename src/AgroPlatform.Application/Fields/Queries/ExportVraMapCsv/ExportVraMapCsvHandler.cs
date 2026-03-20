using System.Text;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.ExportVraMapCsv;

public class ExportVraMapCsvHandler : IRequestHandler<ExportVraMapCsvQuery, byte[]>
{
    private readonly IAppDbContext _context;

    public ExportVraMapCsvHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> Handle(ExportVraMapCsvQuery request, CancellationToken cancellationToken)
    {
        var map = await _context.VraMaps
            .Include(m => m.Zones)
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (map == null)
            throw new NotFoundException(nameof(VraMap), request.Id);

        var sb = new StringBuilder();
        sb.AppendLine("ZoneIndex,ZoneName,NdviValue,SoilOrganicMatter,SoilNitrogen,SoilPhosphorus,SoilPotassium,AreaHectares,RateKgPerHa");

        foreach (var z in map.Zones.OrderBy(z => z.ZoneIndex))
        {
            sb.AppendLine(string.Join(",",
                z.ZoneIndex,
                EscapeCsv(z.ZoneName),
                z.NdviValue?.ToString("0.####") ?? "",
                z.SoilOrganicMatter?.ToString("0.##") ?? "",
                z.SoilNitrogen?.ToString("0.##") ?? "",
                z.SoilPhosphorus?.ToString("0.##") ?? "",
                z.SoilPotassium?.ToString("0.##") ?? "",
                z.AreaHectares.ToString("0.####"),
                z.RateKgPerHa.ToString("0.##")
            ));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string EscapeCsv(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}
