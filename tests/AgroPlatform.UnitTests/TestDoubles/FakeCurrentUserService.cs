using System;
using System.Collections.Generic;
using System.Linq;
using AgroPlatform.Api.Services;

namespace AgroPlatform.UnitTests.TestDoubles
{
    public class FakeCurrentUserService : ICurrentUserService
    {
        public Guid TenantId { get; set; }

        public Guid? GetTenantId() => TenantId;

        public IEnumerable<string> GetRoles() => Enumerable.Empty<string>();
        public string GetUserId() => Guid.NewGuid().ToString(); // Mock user ID
        public string GetUserName() => "FakeUser";
        // Add other methods as necessary to satisfy ICurrentUserService
    }
}