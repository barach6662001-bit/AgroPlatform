using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetRotationAdvice;

public record GetRotationAdviceQuery(int Years) : IRequest<List<RotationAdviceDto>>;
