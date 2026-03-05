namespace AgroPlatform.Application.Economics.DTOs;

public class CostRecordDto
{
    public Guid Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "UAH";
    public DateTime Date { get; set; }
    public Guid? FieldId { get; set; }
    public Guid? AgroOperationId { get; set; }
    public string? Description { get; set; }
}
