using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Approval;
using MediatR;

namespace AgroPlatform.Application.Approval.Commands.CreateApprovalRule;

public class CreateApprovalRuleHandler : IRequestHandler<CreateApprovalRuleCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateApprovalRuleHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateApprovalRuleCommand request, CancellationToken cancellationToken)
    {
        var rule = new ApprovalRule
        {
            EntityType = request.EntityType,
            ActionType = request.ActionType,
            Threshold = request.Threshold,
            RequiredRole = request.RequiredRole
        };

        _context.ApprovalRules.Add(rule);
        await _context.SaveChangesAsync(cancellationToken);

        return rule.Id;
    }
}
