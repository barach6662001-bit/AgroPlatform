using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateField;

public class CreateFieldHandler : IRequestHandler<CreateFieldCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateFieldHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFieldCommand request, CancellationToken cancellationToken)
    {
        var field = new Field
        {
            Name = request.Name,
            CadastralNumber = request.CadastralNumber,
            AreaHectares = request.AreaHectares,
            CurrentCrop = request.CurrentCrop,
            CurrentCropYear = request.CurrentCropYear,
            GeoJson = request.GeoJson,
            SoilType = request.SoilType,
            Notes = request.Notes
        };

        _context.Fields.Add(field);
        await _context.SaveChangesAsync(cancellationToken);
        return field.Id;
    }
}
