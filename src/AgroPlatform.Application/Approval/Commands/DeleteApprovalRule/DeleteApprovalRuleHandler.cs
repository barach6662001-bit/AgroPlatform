using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Approval;
using MediatR;

namespace AgroPlatform.Application.Approval.Commands.DeleteApprovalRule;

public class DeleteApprovalRuleHandler : IRequestHandler<DeleteApprovalRuleCommand>
{
    private readonly IAppDbContext _context;

    public DeleteApprovalRuleHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteApprovalRuleCommand request, CancellationToken cancellationToken)
    {
        var rule = await _context.ApprovalRules.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(ApprovalRule), request.Id);

        rule.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
