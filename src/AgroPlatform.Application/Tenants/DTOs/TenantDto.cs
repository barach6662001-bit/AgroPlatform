namespace AgroPlatform.Application.Tenants.DTOs;

public class TenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Inn { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string? CompanyName { get; set; }
    public string? Edrpou { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
}
