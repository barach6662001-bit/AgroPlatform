using System.Reflection;
using AgroPlatform.Domain.Authorization;
using MediatR;

namespace AgroPlatform.Application.Admin.Queries.GetAvailablePolicies;

public record GetAvailablePoliciesQuery : IRequest<List<string>>;

public class GetAvailablePoliciesHandler : IRequestHandler<GetAvailablePoliciesQuery, List<string>>
{
    public Task<List<string>> Handle(GetAvailablePoliciesQuery request, CancellationToken cancellationToken)
    {
        var policies = typeof(Permissions)
            .GetNestedTypes(BindingFlags.Public | BindingFlags.Static)
            .SelectMany(t => t.GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
                .Where(f => f.IsLiteral && !f.IsInitOnly && f.FieldType == typeof(string))
                .Select(f => (string)f.GetRawConstantValue()!))
            .OrderBy(p => p)
            .ToList();

        return Task.FromResult(policies);
    }
}
