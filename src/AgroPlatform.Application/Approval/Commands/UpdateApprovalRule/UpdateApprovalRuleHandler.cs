using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Approval;
using MediatR;

namespace AgroPlatform.Application.Approval.Commands.UpdateApprovalRule;

public class UpdateApprovalRuleHandler : IRequestHandler<UpdateApprovalRuleCommand>
{
    private readonly IAppDbContext _context;

    public UpdateApprovalRuleHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateApprovalRuleCommand request, CancellationToken cancellationToken)
    {
        var rule = await _context.ApprovalRules.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(ApprovalRule), request.Id);

        rule.EntityType = request.EntityType;
        rule.ActionType = request.ActionType;
        rule.Threshold = request.Threshold;
        rule.RequiredRole = request.RequiredRole;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
