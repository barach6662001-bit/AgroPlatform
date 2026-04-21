using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.ImportItems;

public record ConfirmImportCommand(List<ImportRowDto> Rows) : IRequest<ConfirmImportResult>;

public record ConfirmImportResult(int Created, int Skipped);

public class ConfirmImportHandler : IRequestHandler<ConfirmImportCommand, ConfirmImportResult>
{
    private readonly IAppDbContext _context;

    public ConfirmImportHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ConfirmImportResult> Handle(ConfirmImportCommand request, CancellationToken cancellationToken)
    {
        var validRows = request.Rows.Where(r => r.Errors.Count == 0).ToList();

        var existingCodes = await _context.WarehouseItems
            .Select(i => i.Code)
            .ToListAsync(cancellationToken);

        var existingCodesSet = new HashSet<string>(existingCodes, StringComparer.OrdinalIgnoreCase);

        var created = 0;
        var skipped = 0;

        foreach (var row in validRows)
        {
            if (existingCodesSet.Contains(row.Code))
            {
                skipped++;
                continue;
            }

            _context.WarehouseItems.Add(new WarehouseItem
            {
                Name = row.Name,
                Code = row.Code,
                Category = row.Category,
                BaseUnit = row.BaseUnit,
                Description = row.Description,
                MinimumQuantity = row.MinimumQuantity,
                PurchasePrice = row.PurchasePrice,
            });

            existingCodesSet.Add(row.Code);
            created++;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new ConfirmImportResult(created, skipped);
    }
}
