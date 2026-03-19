using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetFieldById;

public class GetFieldByIdHandler : IRequestHandler<GetFieldByIdQuery, FieldDetailDto?>
{
    private readonly IAppDbContext _context;

    public GetFieldByIdHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<FieldDetailDto?> Handle(GetFieldByIdQuery request, CancellationToken cancellationToken)
    {
        var field = await _context.Fields
            .Include(f => f.CropHistory)
            .Include(f => f.RotationPlans)
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (field == null)
            return null;

        return new FieldDetailDto
        {
            Id = field.Id,
            Name = field.Name,
            CadastralNumber = field.CadastralNumber,
            CadastralArea = field.CadastralArea,
            CadastralPurpose = field.CadastralPurpose,
            CadastralOwnership = field.CadastralOwnership,
            CadastralFetchedAt = field.CadastralFetchedAt,
            AreaHectares = field.AreaHectares,
            CurrentCrop = field.CurrentCrop,
            CurrentCropYear = field.CurrentCropYear,
            SoilType = field.SoilType,
            Notes = field.Notes,
            OwnershipType = (int)field.OwnershipType,
            GeoJson = field.GeoJson,
            CropHistory = field.CropHistory.Select(h => new CropHistoryDto
            {
                Id = h.Id,
                FieldId = h.FieldId,
                Crop = h.Crop,
                Year = h.Year,
                YieldPerHectare = h.YieldPerHectare,
                Notes = h.Notes
            }).ToList(),
            RotationPlans = field.RotationPlans.Select(p => new CropRotationPlanDto
            {
                Id = p.Id,
                FieldId = p.FieldId,
                PlannedCrop = p.PlannedCrop,
                Year = p.Year,
                Notes = p.Notes
            }).ToList()
        };
    }
}
