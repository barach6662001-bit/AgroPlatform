using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using MediatR;

namespace AgroPlatform.Application.Economics.Commands.DeleteCostRecord;

public class DeleteCostRecordHandler : IRequestHandler<DeleteCostRecordCommand>
{
    private readonly IAppDbContext _context;

    public DeleteCostRecordHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteCostRecordCommand request, CancellationToken cancellationToken)
    {
        var record = await _context.CostRecords.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(CostRecord), request.Id);

        record.IsDeleted = true;
        record.DeletedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
