using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using MediatR;

namespace AgroPlatform.Application.Economics.Commands.CreateCostRecord;

public class CreateCostRecordHandler : IRequestHandler<CreateCostRecordCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateCostRecordHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateCostRecordCommand request, CancellationToken cancellationToken)
    {
        var record = new CostRecord
        {
            Category = request.Category,
            Amount = request.Amount,
            Currency = request.Currency,
            Date = request.Date,
            FieldId = request.FieldId,
            AgroOperationId = request.AgroOperationId,
            Description = request.Description
        };

        _context.CostRecords.Add(record);
        await _context.SaveChangesAsync(cancellationToken);
        return record.Id;
    }
}
