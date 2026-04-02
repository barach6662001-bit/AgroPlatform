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

    /// <summary>When true, user must change their password before accessing the application.</summary>
    public bool RequirePasswordChange { get; set; } = true;

    /// <summary>Tracks which admin created this user.</summary>
    public string? CreatedByUserId { get; set; }

    /// <summary>Whether the user has completed the onboarding wizard.</summary>
    public bool HasCompletedOnboarding { get; set; }
}
