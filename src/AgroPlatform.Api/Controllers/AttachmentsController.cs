using AgroPlatform.Application.Attachments.Commands.UploadAttachment;
using AgroPlatform.Application.Attachments.Queries.DownloadAttachment;
using AgroPlatform.Application.Attachments.Queries.ListAttachments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/attachments")]
[Produces("application/json")]
public class AttachmentsController : ControllerBase
{
    private readonly ISender _sender;

    public AttachmentsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Upload([FromForm] UploadAttachmentRequest request, CancellationToken cancellationToken)
    {
        await using var stream = new MemoryStream();
        await request.File.CopyToAsync(stream, cancellationToken);

        var result = await _sender.Send(
            new UploadAttachmentCommand(
                request.EntityType,
                request.EntityId,
                request.File.FileName,
                request.File.ContentType,
                stream.ToArray(),
                request.Description),
            cancellationToken);

        return CreatedAtAction(nameof(List), new { request.EntityType, request.EntityId }, result);
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> List([FromQuery] string entityType, [FromQuery] Guid entityId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ListAttachmentsQuery(entityType, entityId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new DownloadAttachmentQuery(id), cancellationToken);
        return File(result.Content, result.ContentType, result.FileName);
    }
}

public class UploadAttachmentRequest
{
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public IFormFile File { get; set; } = default!;
    public string? Description { get; set; }
}