using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Queries.GetInventorySessionById;

public class GetInventorySessionByIdHandler : IRequestHandler<GetInventorySessionByIdQuery, InventorySessionDetailDto>
{
    private readonly IAppDbContext _context;

    public GetInventorySessionByIdHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<InventorySessionDetailDto> Handle(GetInventorySessionByIdQuery request, CancellationToken cancellationToken)
    {
        var session = await _context.InventorySessions
            .Include(s => s.Warehouse)
            .Include(s => s.Lines)
                .ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken)
            ?? throw new NotFoundException(nameof(InventorySession), request.SessionId);

        return new InventorySessionDetailDto
        {
            Id = session.Id,
            WarehouseId = session.WarehouseId,
            WarehouseName = session.Warehouse.Name,
            Status = session.Status,
            Notes = session.Notes,
            CreatedAtUtc = session.CreatedAtUtc,
            CompletedAtUtc = session.CompletedAtUtc,
            Lines = session.Lines.Select(l => new InventorySessionLineDto
            {
                Id = l.Id,
                ItemId = l.ItemId,
                ItemName = l.Item.Name,
                ItemCode = l.Item.Code,
                BatchId = l.BatchId,
                ExpectedQuantityBase = l.ExpectedQuantityBase,
                ActualQuantityBase = l.ActualQuantityBase,
                BaseUnit = l.BaseUnit,
                IsCountRecorded = l.IsCountRecorded,
                Note = l.Note
            }).ToList()
        };
    }
}
