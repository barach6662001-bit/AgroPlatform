using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;

namespace AgroPlatform.Application.Fields.Commands.UpdateYield;

public class UpdateYieldHandler : IRequestHandler<UpdateYieldCommand>
{
    private readonly IAppDbContext _context;

    public UpdateYieldHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateYieldCommand request, CancellationToken cancellationToken)
    {
        var history = await _context.FieldCropHistories.FindAsync(new object[] { request.CropHistoryId }, cancellationToken)
            ?? throw new NotFoundException(nameof(FieldCropHistory), request.CropHistoryId);

        history.YieldPerHectare = request.YieldPerHectare;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
