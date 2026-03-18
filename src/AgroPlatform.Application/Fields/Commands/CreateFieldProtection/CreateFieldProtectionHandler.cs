using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldProtection;

public class CreateFieldProtectionHandler : IRequestHandler<CreateFieldProtectionCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateFieldProtectionHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFieldProtectionCommand request, CancellationToken cancellationToken)
    {
        var fieldExists = await _context.Fields
            .AnyAsync(f => f.Id == request.FieldId, cancellationToken);

        if (!fieldExists)
            throw new NotFoundException(nameof(Field), request.FieldId);

        var protection = new FieldProtection
        {
            FieldId = request.FieldId,
            Year = request.Year,
            ProductName = request.ProductName,
            ProtectionType = request.ProtectionType,
            RateLPerHa = request.RateLPerHa,
            TotalLiters = request.TotalLiters,
            CostPerLiter = request.CostPerLiter,
            TotalCost = request.TotalCost,
            ApplicationDate = request.ApplicationDate,
            Notes = request.Notes,
        };

        _context.FieldProtections.Add(protection);
        await _context.SaveChangesAsync(cancellationToken);
        return protection.Id;
    }
}
