using AgroPlatform.Application.Approval.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Approval.Queries.GetApprovalRules;

public class GetApprovalRulesHandler : IRequestHandler<GetApprovalRulesQuery, List<ApprovalRuleDto>>
{
    private readonly IAppDbContext _context;

    public GetApprovalRulesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ApprovalRuleDto>> Handle(GetApprovalRulesQuery request, CancellationToken cancellationToken)
    {
        return await _context.ApprovalRules
            .OrderBy(r => r.EntityType)
            .ThenBy(r => r.ActionType)
            .Select(r => new ApprovalRuleDto(
                r.Id,
                r.EntityType,
                r.ActionType,
                r.Threshold,
                r.RequiredRole))
            .ToListAsync(cancellationToken);
    }
}
