using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Fields;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.CreateAgroOperation;

public class CreateAgroOperationHandler : IRequestHandler<CreateAgroOperationCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateAgroOperationHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateAgroOperationCommand request, CancellationToken cancellationToken)
    {
        _ = await _context.Fields.FindAsync(new object[] { request.FieldId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Field), request.FieldId);

        var operation = new AgroOperation
        {
            FieldId = request.FieldId,
            OperationType = request.OperationType,
            PlannedDate = request.PlannedDate,
            IsCompleted = false,
            CompletedDate = null,
            Description = request.Description,
            AreaProcessed = request.AreaProcessed
        };

        _context.AgroOperations.Add(operation);
        await _context.SaveChangesAsync(cancellationToken);
        return operation.Id;
    }
}
