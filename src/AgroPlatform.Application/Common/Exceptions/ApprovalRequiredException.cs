namespace AgroPlatform.Application.Common.Exceptions;

public class ApprovalRequiredException : Exception
{
    public Guid ApprovalRequestId { get; }

    public ApprovalRequiredException(Guid approvalRequestId)
        : base($"Operation requires approval. ApprovalRequest ID: {approvalRequestId}")
    {
        ApprovalRequestId = approvalRequestId;
    }
}
