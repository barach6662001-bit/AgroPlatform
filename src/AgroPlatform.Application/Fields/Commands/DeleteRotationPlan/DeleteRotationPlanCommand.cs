using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteRotationPlan;

public record DeleteRotationPlanCommand(Guid PlanId) : IRequest;
