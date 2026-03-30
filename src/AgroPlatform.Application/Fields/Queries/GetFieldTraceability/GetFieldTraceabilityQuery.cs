using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetFieldTraceability;

/// <summary>
/// Returns a full traceability chain for a field:
/// warehouse issues → agro operations → field harvests → grain batches → sales.
/// </summary>
public record GetFieldTraceabilityQuery(Guid FieldId, int? Year = null) : IRequest<FieldTraceabilityDto>;
