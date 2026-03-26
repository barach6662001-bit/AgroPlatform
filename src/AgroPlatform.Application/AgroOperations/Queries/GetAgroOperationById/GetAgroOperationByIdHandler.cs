using AgroPlatform.Application.AgroOperations.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.AgroOperations.Queries.GetAgroOperationById;

public class GetAgroOperationByIdHandler : IRequestHandler<GetAgroOperationByIdQuery, AgroOperationDetailDto?>
{
    private readonly IAppDbContext _context;

    public GetAgroOperationByIdHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<AgroOperationDetailDto?> Handle(GetAgroOperationByIdQuery request, CancellationToken cancellationToken)
    {
        var operation = await _context.AgroOperations
            .Include(o => o.Field)
            .Include(o => o.Resources)
                .ThenInclude(r => r.WarehouseItem)
            .Include(o => o.MachineryUsed)
                .ThenInclude(m => m.Machine)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (operation == null)
            return null;

        return new AgroOperationDetailDto
        {
            Id = operation.Id,
            FieldId = operation.FieldId,
            FieldName = operation.Field.Name,
            OperationType = operation.OperationType,
            Status = operation.Status,
            PlannedDate = operation.PlannedDate,
            CompletedDate = operation.CompletedDate,
            Description = operation.Description,
            AreaProcessed = operation.AreaProcessed,
            Resources = operation.Resources.Select(r => new AgroOperationResourceDto
            {
                Id = r.Id,
                WarehouseItemId = r.WarehouseItemId,
                WarehouseItemName = r.WarehouseItem.Name,
                WarehouseId = r.WarehouseId,
                StockMoveId = r.StockMoveId,
                PlannedQuantity = r.PlannedQuantity,
                ActualQuantity = r.ActualQuantity,
                UnitCode = r.UnitCode
            }).ToList(),
            MachineryUsed = operation.MachineryUsed.Select(m => new AgroOperationMachineryDto
            {
                Id = m.Id,
                MachineId = m.MachineId,
                MachineName = m.Machine.Name,
                HoursWorked = m.HoursWorked,
                FuelUsed = m.FuelUsed,
                OperatorName = m.OperatorName
            }).ToList()
        };
    }
}
