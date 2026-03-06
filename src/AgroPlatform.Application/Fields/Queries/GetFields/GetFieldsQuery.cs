using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Fields.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetFields;

public record GetFieldsQuery(
    CropType? CurrentCrop,
    string? SearchTerm,
    int Page = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<FieldDto>>;
