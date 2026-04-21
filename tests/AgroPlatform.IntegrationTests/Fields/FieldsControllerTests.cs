using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Fields;

[Collection("Integration Tests")]
public class FieldsControllerTests : IntegrationTestBase
{
    public FieldsControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private async Task<Guid> CreateFieldAsync(string name = "Test Field")
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

    [Fact]
    public async Task CreateField_ReturnsCreated()
    {
        var response = await PostAsync("/api/fields", new
        {
            name = "North Field",
            areaHectares = 100.0,
            soilType = "Chernozem"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        result.GetProperty("id").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetFields_ReturnsOk()
    {
        await CreateFieldAsync("GetFields Test Field");

        var result = await GetAsync<JsonElement>("/api/fields");

        result.ValueKind.Should().NotBe(JsonValueKind.Null);
        result.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetFieldById_ReturnsField()
    {
        var fieldId = await CreateFieldAsync("GetById Test Field");

        var result = await GetAsync<JsonElement>($"/api/fields/{fieldId}");

        result.ValueKind.Should().NotBe(JsonValueKind.Null);
        result.GetProperty("id").GetGuid().Should().Be(fieldId);
    }

    [Fact]
    public async Task UpdateField_ReturnsNoContent()
    {
        var fieldId = await CreateFieldAsync("Update Test Field");

        var response = await PutAsync($"/api/fields/{fieldId}", new
        {
            id = fieldId,
            name = "Updated Field Name",
            areaHectares = 60.0,
            soilType = "Sandy"
        });

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteField_ReturnsNoContent()
    {
        var fieldId = await CreateFieldAsync("Delete Test Field");

        var response = await DeleteAsync($"/api/fields/{fieldId}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task AssignCrop_ReturnsCreated()
    {
        var fieldId = await CreateFieldAsync("Crop Assignment Field");

        var response = await PostAsync("/api/fields/assign-crop", new
        {
            fieldId,
            crop = "Wheat",
            year = 2024,
            yieldPerHectare = 5.5
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task PlanRotation_ReturnsCreated()
    {
        var fieldId = await CreateFieldAsync("Rotation Plan Field");

        var response = await PostAsync("/api/fields/rotation-plans", new
        {
            fieldId,
            year = 2025,
            plannedCrop = "Corn",
            notes = "Test rotation"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
