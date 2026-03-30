using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fuel.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fuel.Queries.GetFuelConsumptionComparison;

public class GetFuelConsumptionComparisonHandler
    : IRequestHandler<GetFuelConsumptionComparisonQuery, IReadOnlyList<FuelConsumptionComparisonDto>>
{
    private readonly IAppDbContext _context;

    public GetFuelConsumptionComparisonHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<FuelConsumptionComparisonDto>> Handle(
        GetFuelConsumptionComparisonQuery request, CancellationToken cancellationToken)
    {
        // Load all active fuel norms (tenant-scoped via global filter)
        var norms = await _context.FuelNorms
            .AsNoTracking()
            .Where(n => !n.IsDeleted)
            .ToListAsync(cancellationToken);

        if (norms.Count == 0)
            return Array.Empty<FuelConsumptionComparisonDto>();

        // Load fuel issue transactions for the period, grouped by machine
        var txQuery = _context.FuelTransactions
            .AsNoTracking()
            .Where(t => !t.IsDeleted && t.TransactionType == "Issue" && t.MachineId.HasValue);

        if (request.DateFrom.HasValue)
            txQuery = txQuery.Where(t => t.TransactionDate >= request.DateFrom.Value);
        if (request.DateTo.HasValue)
            txQuery = txQuery.Where(t => t.TransactionDate <= request.DateTo.Value);
        if (request.FieldId.HasValue)
            txQuery = txQuery.Where(t => t.FieldId == request.FieldId.Value);

        var transactions = await txQuery
            .Select(t => new { t.MachineId, t.QuantityLiters })
            .ToListAsync(cancellationToken);

        // Load relevant machines
        var machineIds = transactions.Select(t => t.MachineId!.Value).Distinct().ToList();
        var machines = await _context.Machines
            .AsNoTracking()
            .Where(m => machineIds.Contains(m.Id))
            .Select(m => new { m.Id, m.Name, m.Type })
            .ToListAsync(cancellationToken);

        // Load AgroOperations that used these machines in the period to get area processed
        var agroOpsQuery = _context.AgroOperations
            .AsNoTracking()
            .Where(op => !op.IsDeleted);

        if (request.DateFrom.HasValue)
            agroOpsQuery = agroOpsQuery.Where(op => op.CompletedDate >= request.DateFrom.Value);
        if (request.DateTo.HasValue)
            agroOpsQuery = agroOpsQuery.Where(op => op.CompletedDate <= request.DateTo.Value);
        if (request.FieldId.HasValue)
            agroOpsQuery = agroOpsQuery.Where(op => op.FieldId == request.FieldId.Value);

        var agroOps = await agroOpsQuery
            .Select(op => new { op.OperationType, op.AreaProcessed })
            .ToListAsync(cancellationToken);

        // Build norm lookup
        var normLookup = norms.ToDictionary(n => (n.MachineType, n.OperationType));

        var result = new List<FuelConsumptionComparisonDto>();

        foreach (var machine in machines)
        {
            var actualLiters = transactions
                .Where(t => t.MachineId == machine.Id)
                .Sum(t => t.QuantityLiters);

            // Find matching norm for this machine type
            // Use the most common operation type across agroOps or the first available norm
            var matchingNorm = norms.FirstOrDefault(n => n.MachineType == machine.Type);
            if (matchingNorm is null) continue;

            var totalAreaHa = agroOps
                .Where(op => op.OperationType == matchingNorm.OperationType && op.AreaProcessed.HasValue)
                .Sum(op => op.AreaProcessed ?? 0);

            decimal? expectedLiters = null;
            if (matchingNorm.NormLitersPerHa.HasValue && totalAreaHa > 0)
                expectedLiters = Math.Round(matchingNorm.NormLitersPerHa.Value * totalAreaHa, 2);

            decimal? deviationLiters = expectedLiters.HasValue
                ? Math.Round(actualLiters - expectedLiters.Value, 2)
                : null;

            decimal? deviationPercent = expectedLiters.HasValue && expectedLiters > 0
                ? Math.Round((actualLiters - expectedLiters.Value) / expectedLiters.Value * 100, 1)
                : null;

            result.Add(new FuelConsumptionComparisonDto
            {
                MachineId = machine.Id,
                MachineName = machine.Name,
                MachineType = machine.Type.ToString(),
                OperationType = matchingNorm.OperationType.ToString(),
                ActualLiters = actualLiters,
                AreaHa = totalAreaHa > 0 ? totalAreaHa : null,
                NormLitersPerHa = matchingNorm.NormLitersPerHa,
                ExpectedLiters = expectedLiters,
                DeviationLiters = deviationLiters,
                DeviationPercent = deviationPercent,
            });
        }

        return result.OrderByDescending(r => Math.Abs(r.DeviationPercent ?? 0)).ToList();
    }
}
