using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using MediatR;

namespace AgroPlatform.Application.Fields.Commands.UpdateField;

public class UpdateFieldHandler : IRequestHandler<UpdateFieldCommand>
{
    private readonly IAppDbContext _context;

    public UpdateFieldHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateFieldCommand request, CancellationToken cancellationToken)
    {
        var field = await _context.Fields.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(Field), request.Id);

        field.Name = request.Name;
        field.CadastralNumber = request.CadastralNumber;
        field.AreaHectares = request.AreaHectares;
        field.CurrentCrop = request.CurrentCrop;
        field.CurrentCropYear = request.CurrentCropYear;
        field.GeoJson = request.GeoJson;
        field.SoilType = request.SoilType;
        field.Notes = request.Notes;
        field.OwnershipType = (LandOwnershipType)request.OwnershipType;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
