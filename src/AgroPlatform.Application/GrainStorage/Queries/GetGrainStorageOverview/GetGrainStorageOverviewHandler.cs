using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.GrainStorage.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainStorageOverview;

public class GetGrainStorageOverviewHandler
    : IRequestHandler<GetGrainStorageOverviewQuery, IReadOnlyList<GrainStorageOverviewDto>>
{
    private readonly IAppDbContext _context;

    public GetGrainStorageOverviewHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<GrainStorageOverviewDto>> Handle(
        GetGrainStorageOverviewQuery request,
        CancellationToken cancellationToken)
    {
        // --- Load storages ---
        var storageQuery = _context.GrainStorages.AsQueryable();

        if (request.ActiveOnly.HasValue)
            storageQuery = storageQuery.Where(s => s.IsActive == request.ActiveOnly.Value);

        if (request.StorageId.HasValue)
            storageQuery = storageQuery.Where(s => s.Id == request.StorageId.Value);

        var storages = await storageQuery
            .OrderBy(s => s.Name)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Code,
                s.Location,
                s.StorageType,
                s.CapacityTons,
                s.IsActive,
                s.Notes,
            })
            .ToListAsync(cancellationToken);

        if (storages.Count == 0)
            return [];

        var storageIds = storages.Select(s => s.Id).ToList();

        // --- Load all active placements for these storages ---
        var placements = await _context.GrainBatchPlacements
            .Where(p => storageIds.Contains(p.GrainStorageId) && p.GrainBatch.QuantityTons > 0)
            .Include(p => p.GrainBatch).ThenInclude(b => b.SourceField)
            .ToListAsync(cancellationToken);

        var batchesByStorage = placements
            .GroupBy(p => p.GrainStorageId)
            .ToDictionary(g => g.Key, g => g.Select(p => new GrainBatchSummaryDto
            {
                Id = p.GrainBatch.Id,
                GrainStorageId = p.GrainStorageId,
                GrainType = p.GrainBatch.GrainType,
                QuantityTons = p.QuantityTons,
                InitialQuantityTons = p.GrainBatch.InitialQuantityTons,
                OwnershipType = p.GrainBatch.OwnershipType,
                OwnerName = p.GrainBatch.OwnerName,
                ReceivedDate = p.GrainBatch.ReceivedDate,
                MoisturePercent = p.GrainBatch.MoisturePercent,
                SourceFieldName = p.GrainBatch.SourceFieldId != null ? p.GrainBatch.SourceField?.Name : null,
                ContractNumber = p.GrainBatch.ContractNumber,
            }).ToList());

        // --- Assemble result ---
        var result = new List<GrainStorageOverviewDto>(storages.Count);

        foreach (var s in storages)
        {
            var storageBatches = batchesByStorage.GetValueOrDefault(s.Id, []);
            var occupiedTons = storageBatches.Sum(b => b.QuantityTons);
            var grainTypes = storageBatches
                .Select(b => b.GrainType)
                .Distinct()
                .OrderBy(t => t)
                .ToList();

            decimal? freeTons = s.CapacityTons.HasValue
                ? Math.Max(0m, s.CapacityTons.Value - occupiedTons)
                : null;

            decimal? occupancyPercent = s.CapacityTons.HasValue && s.CapacityTons.Value > 0
                ? Math.Round(occupiedTons / s.CapacityTons.Value * 100m, 1)
                : null;

            // Build warnings
            var warnings = new List<string>();

            if (grainTypes.Count > 1)
                warnings.Add($"Mixed crops: {string.Join(", ", grainTypes)}");

            if (s.CapacityTons.HasValue && occupiedTons > s.CapacityTons.Value)
                warnings.Add($"Over capacity by {occupiedTons - s.CapacityTons.Value:F1} t");

            if (s.IsActive && storageBatches.Count == 0 && s.CapacityTons.HasValue)
                warnings.Add("Storage is empty");

            // Check for high moisture batches (>15%)
            var highMoistureBatches = storageBatches
                .Where(b => b.MoisturePercent.HasValue && b.MoisturePercent.Value > 15m)
                .ToList();
            if (highMoistureBatches.Count > 0)
                warnings.Add($"{highMoistureBatches.Count} batch(es) with high moisture (>15%)");

            result.Add(new GrainStorageOverviewDto
            {
                Id = s.Id,
                Name = s.Name,
                Code = s.Code,
                Location = s.Location,
                StorageType = s.StorageType,
                CapacityTons = s.CapacityTons,
                IsActive = s.IsActive,
                Notes = s.Notes,
                OccupiedTons = occupiedTons,
                FreeTons = freeTons,
                OccupancyPercent = occupancyPercent,
                BatchCount = storageBatches.Count,
                GrainTypes = grainTypes,
                Batches = storageBatches,
                Warnings = warnings,
            });
        }

        return result;
    }
}
