using AgroPlatform.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Domain.Users;

public class AppUser : IdentityUser
{
    public Guid TenantId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    /// <summary>Firebase Cloud Messaging registration token for push notifications.</summary>
    public string? FcmToken { get; set; }
}
