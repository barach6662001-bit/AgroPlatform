using MediatR;

namespace AgroPlatform.Application.Fields.Commands.UpdateYield;

public record UpdateYieldCommand(
    Guid CropHistoryId,
    decimal YieldPerHectare
) : IRequest;
