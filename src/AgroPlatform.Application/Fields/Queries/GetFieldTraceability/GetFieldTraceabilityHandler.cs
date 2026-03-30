using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetFieldTraceability;

public class GetFieldTraceabilityHandler : IRequestHandler<GetFieldTraceabilityQuery, FieldTraceabilityDto>
{
    private readonly IAppDbContext _context;

    public GetFieldTraceabilityHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<FieldTraceabilityDto> Handle(GetFieldTraceabilityQuery request, CancellationToken cancellationToken)
    {
        var field = await _context.Fields
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == request.FieldId, cancellationToken)
            ?? throw new NotFoundException(nameof(Field), request.FieldId);

        DateTime? yearStart = request.Year.HasValue
            ? new DateTime(request.Year.Value, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            : null;
        DateTime? yearEnd = request.Year.HasValue
            ? new DateTime(request.Year.Value, 12, 31, 23, 59, 59, DateTimeKind.Utc)
            : null;

        // 1. Warehouse issues (StockLedgerEntries with FieldId)
        var ledgerQuery = _context.StockLedgerEntries
            .Where(e => e.FieldId == request.FieldId && e.QuantityBase < 0); // negative = stock out / issue

        if (yearStart.HasValue)
            ledgerQuery = ledgerQuery.Where(e => e.CreatedAtUtc >= yearStart.Value);
        if (yearEnd.HasValue)
            ledgerQuery = ledgerQuery.Where(e => e.CreatedAtUtc <= yearEnd.Value);

        var ledgerEntries = await ledgerQuery
            .OrderBy(e => e.CreatedAtUtc)
            .Select(e => new { e.Id, e.CreatedAtUtc, e.ItemId, e.Quantity, e.UnitCode, e.TotalCost, e.AgroOperationId, e.Note })
            .ToListAsync(cancellationToken);

        // Load item names
        var itemIds = ledgerEntries.Select(e => e.ItemId).Distinct().ToList();
        var itemNames = await _context.WarehouseItems
            .AsNoTracking()
            .Where(i => itemIds.Contains(i.Id))
            .Select(i => new { i.Id, i.Name })
            .ToListAsync(cancellationToken);
        var itemNameMap = itemNames.ToDictionary(i => i.Id, i => i.Name);

        var warehouseIssues = ledgerEntries.Select(e => new TraceWarehouseIssueDto
        {
            LedgerId = e.Id,
            IssuedAt = e.CreatedAtUtc,
            ItemName = itemNameMap.TryGetValue(e.ItemId, out var name) ? name : null,
            Quantity = Math.Abs(e.Quantity),
            UnitCode = e.UnitCode,
            TotalCost = e.TotalCost,
            AgroOperationId = e.AgroOperationId,
            Note = e.Note,
        }).ToList();

        // 2. Agro operations
        var agroOpsQuery = _context.AgroOperations
            .AsNoTracking()
            .Where(op => !op.IsDeleted && op.FieldId == request.FieldId);

        if (yearStart.HasValue)
            agroOpsQuery = agroOpsQuery.Where(op => op.PlannedDate >= yearStart.Value);
        if (yearEnd.HasValue)
            agroOpsQuery = agroOpsQuery.Where(op => op.PlannedDate <= yearEnd.Value);

        var agroOps = await agroOpsQuery
            .OrderBy(op => op.PlannedDate)
            .Select(op => new TraceAgroOperationDto
            {
                Id = op.Id,
                OperationType = op.OperationType.ToString(),
                PlannedDate = op.PlannedDate,
                CompletedDate = op.CompletedDate,
                Status = op.Status.ToString(),
                AreaProcessed = op.AreaProcessed,
            })
            .ToListAsync(cancellationToken);

        // 3. Harvests
        var harvestsQuery = _context.FieldHarvests
            .AsNoTracking()
            .Where(h => !h.IsDeleted && h.FieldId == request.FieldId);

        if (request.Year.HasValue)
            harvestsQuery = harvestsQuery.Where(h => h.Year == request.Year.Value);

        var harvestRaw = await harvestsQuery
            .OrderByDescending(h => h.Year)
            .Select(h => new { h.Id, h.Year, h.CropName, h.YieldTonsPerHa, h.TotalTons })
            .ToListAsync(cancellationToken);

        var harvests = harvestRaw.Select(h => new TraceHarvestDto
        {
            Id = h.Id,
            Year = h.Year,
            YieldTonsPerHa = h.YieldTonsPerHa,
            TotalYieldTons = h.TotalTons > 0 ? h.TotalTons : (field.AreaHectares > 0 && h.YieldTonsPerHa.HasValue
                ? Math.Round(h.YieldTonsPerHa.Value * field.AreaHectares, 2)
                : (decimal?)null),
            CropType = h.CropName,
        }).ToList();

        // 4. Grain batches from this field
        var grainBatchesQuery = _context.GrainBatches
            .AsNoTracking()
            .Where(b => !b.IsDeleted && b.SourceFieldId == request.FieldId);

        if (yearStart.HasValue)
            grainBatchesQuery = grainBatchesQuery.Where(b => b.ReceivedDate >= yearStart.Value);
        if (yearEnd.HasValue)
            grainBatchesQuery = grainBatchesQuery.Where(b => b.ReceivedDate <= yearEnd.Value);

        var grainBatches = await grainBatchesQuery
            .OrderByDescending(b => b.ReceivedDate)
            .Select(b => new TraceGrainBatchDto
            {
                Id = b.Id,
                GrainType = b.GrainType,
                QuantityTons = b.QuantityTons,
                InitialQuantityTons = b.InitialQuantityTons,
                ReceivedDate = b.ReceivedDate,
                PricePerTon = b.PricePerTon,
            })
            .ToListAsync(cancellationToken);

        // 5. Sales linked to this field
        var salesQuery = _context.Sales
            .AsNoTracking()
            .Where(s => !s.IsDeleted && s.FieldId == request.FieldId);

        if (yearStart.HasValue)
            salesQuery = salesQuery.Where(s => s.Date >= yearStart.Value);
        if (yearEnd.HasValue)
            salesQuery = salesQuery.Where(s => s.Date <= yearEnd.Value);

        var sales = await salesQuery
            .OrderByDescending(s => s.Date)
            .Select(s => new TraceSaleDto
            {
                Id = s.Id,
                Date = s.Date,
                BuyerName = s.BuyerName,
                Product = s.Product,
                Quantity = s.Quantity,
                Unit = s.Unit,
                TotalAmount = s.TotalAmount,
                Currency = s.Currency,
            })
            .ToListAsync(cancellationToken);

        return new FieldTraceabilityDto
        {
            FieldId = field.Id,
            FieldName = field.Name,
            AreaHectares = field.AreaHectares,
            WarehouseIssues = warehouseIssues,
            AgroOperations = agroOps,
            Harvests = harvests,
            GrainBatches = grainBatches,
            Sales = sales,
        };
    }
}
