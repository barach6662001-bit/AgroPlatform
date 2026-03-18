using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldSeeding;

public class CreateFieldSeedingHandler : IRequestHandler<CreateFieldSeedingCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateFieldSeedingHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFieldSeedingCommand request, CancellationToken cancellationToken)
    {
        var fieldExists = await _context.Fields
            .AnyAsync(f => f.Id == request.FieldId, cancellationToken);

        if (!fieldExists)
            throw new NotFoundException(nameof(Field), request.FieldId);

        var seeding = new FieldSeeding
        {
            FieldId = request.FieldId,
            Year = request.Year,
            CropName = request.CropName,
            Variety = request.Variety,
            SeedingRateKgPerHa = request.SeedingRateKgPerHa,
            TotalSeedKg = request.TotalSeedKg,
            SeedingDate = request.SeedingDate,
            Notes = request.Notes,
        };

        _context.FieldSeedings.Add(seeding);
        await _context.SaveChangesAsync(cancellationToken);
        return seeding.Id;
    }
}
