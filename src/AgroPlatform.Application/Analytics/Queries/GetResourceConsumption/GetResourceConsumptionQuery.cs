using AgroPlatform.Application.Analytics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Analytics.Queries.GetResourceConsumption;

public record GetResourceConsumptionQuery(
    DateTime? DateFrom,
    DateTime? DateTo,
    Guid? FieldId) : IRequest<List<ResourceConsumptionDto>>;
