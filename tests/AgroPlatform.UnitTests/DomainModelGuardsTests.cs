using AgroPlatform.Domain.Common;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests;

public class DomainModelGuardsTests
{
    [Fact]
    public void TestDbContext_ShouldNotMap_DomainEvent_AsEntity()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestDbContext(options);

        context.Model.FindEntityType(typeof(DomainEvent)).Should().BeNull();
    }
}
