using AgroPlatform.Application.Fields.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetFields;

public record GetFieldsQuery(CropType? CurrentCrop, string? SearchTerm) : IRequest<List<FieldDto>>;
