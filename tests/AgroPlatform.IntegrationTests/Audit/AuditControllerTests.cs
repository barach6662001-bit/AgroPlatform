using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Audit;

[Collection("Integration Tests")]
public class AuditControllerTests : IntegrationTestBase
{
    public AuditControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task UpdatingField_CapturesBeforeAfterDiffAndAffectedColumns()
    {
        var fieldId = await CreateFieldAsync("Audit Diff Field");

        var updateResponse = await PutAsync($"/api/fields/{fieldId}", new
        {
            id = fieldId,
            name = "Audit Diff Field Updated",
            areaHectares = 88.75,
            soilType = "Loam"
        });

        updateResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var auditResponse = await Client.GetAsync("/api/audit?entityType=Field&action=Updated&page=1&pageSize=50");

        auditResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await auditResponse.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var matchingEntry = payload
            .GetProperty("items")
            .EnumerateArray()
            .FirstOrDefault(item => item.GetProperty("entityId").GetString() == fieldId.ToString());

        matchingEntry.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        matchingEntry.GetProperty("oldValues").GetString().Should().Contain("Audit Diff Field");
        matchingEntry.GetProperty("newValues").GetString().Should().Contain("Audit Diff Field Updated");

        var affectedColumns = matchingEntry
            .GetProperty("affectedColumns")
            .EnumerateArray()
            .Select(item => item.GetString())
            .Where(value => value is not null)
            .Cast<string>()
            .ToArray();

        affectedColumns.Should().Contain("Name");
        affectedColumns.Should().Contain("AreaHectares");
        affectedColumns.Should().Contain("SoilType");
    }

    private async Task<Guid> CreateFieldAsync(string name)
    {
        var response = await PostAsync("/api/fields", new
        {
            name,
            areaHectares = 50.0,
            cadastralNumber = $"CAD-{Guid.NewGuid():N}".Substring(0, 20),
            soilType = "Chernozem"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }
}