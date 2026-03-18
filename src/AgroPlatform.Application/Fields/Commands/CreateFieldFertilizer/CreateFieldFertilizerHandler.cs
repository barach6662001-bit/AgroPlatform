using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldFertilizer;

public class CreateFieldFertilizerHandler : IRequestHandler<CreateFieldFertilizerCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateFieldFertilizerHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFieldFertilizerCommand request, CancellationToken cancellationToken)
    {
        var fieldExists = await _context.Fields
            .AnyAsync(f => f.Id == request.FieldId, cancellationToken);

        if (!fieldExists)
            throw new NotFoundException(nameof(Field), request.FieldId);

        var fertilizer = new FieldFertilizer
        {
            FieldId = request.FieldId,
            Year = request.Year,
            FertilizerName = request.FertilizerName,
            ApplicationType = request.ApplicationType,
            RateKgPerHa = request.RateKgPerHa,
            TotalKg = request.TotalKg,
            CostPerKg = request.CostPerKg,
            TotalCost = request.TotalCost,
            ApplicationDate = request.ApplicationDate,
            Notes = request.Notes,
        };

        _context.FieldFertilizers.Add(fertilizer);
        await _context.SaveChangesAsync(cancellationToken);
        return fertilizer.Id;
    }
}
