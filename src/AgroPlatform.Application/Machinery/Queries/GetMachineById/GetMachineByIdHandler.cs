using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Machinery.Queries.GetMachineById;

public class GetMachineByIdHandler : IRequestHandler<GetMachineByIdQuery, MachineDetailDto?>
{
    private readonly IAppDbContext _context;

    public GetMachineByIdHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<MachineDetailDto?> Handle(GetMachineByIdQuery request, CancellationToken cancellationToken)
    {
        var machine = await _context.Machines
            .Include(m => m.WorkLogs)
            .Include(m => m.FuelLogs)
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (machine == null)
            return null;

        return new MachineDetailDto
        {
            Id = machine.Id,
            Name = machine.Name,
            InventoryNumber = machine.InventoryNumber,
            Type = machine.Type,
            Brand = machine.Brand,
            Model = machine.Model,
            Year = machine.Year,
            Status = machine.Status,
            FuelType = machine.FuelType,
            FuelConsumptionPerHour = machine.FuelConsumptionPerHour,
            TotalHoursWorked = machine.WorkLogs.Sum(w => w.HoursWorked),
            TotalFuelConsumed = machine.FuelLogs.Sum(f => f.Quantity),
            RecentWorkLogs = machine.WorkLogs
                .OrderByDescending(w => w.Date)
                .Take(10)
                .Select(w => new WorkLogDto
                {
                    Id = w.Id,
                    MachineId = w.MachineId,
                    Date = w.Date,
                    HoursWorked = w.HoursWorked,
                    AgroOperationId = w.AgroOperationId,
                    Description = w.Description
                })
                .ToList(),
            RecentFuelLogs = machine.FuelLogs
                .OrderByDescending(f => f.Date)
                .Take(10)
                .Select(f => new FuelLogDto
                {
                    Id = f.Id,
                    MachineId = f.MachineId,
                    Date = f.Date,
                    Quantity = f.Quantity,
                    FuelType = f.FuelType,
                    Note = f.Note
                })
                .ToList()
        };
    }
}
