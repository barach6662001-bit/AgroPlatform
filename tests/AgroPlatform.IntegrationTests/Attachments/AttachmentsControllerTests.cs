using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using FluentAssertions;

namespace AgroPlatform.IntegrationTests.Attachments;

[Collection("Integration Tests")]
public class AttachmentsControllerTests : IntegrationTestBase
{
    public AttachmentsControllerTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task UploadListAndDownload_Attachment_WorksPerEntity()
    {
        var fieldId = await CreateFieldAsync("Attachment Field");

        using var multipart = new MultipartFormDataContent();
        multipart.Add(new StringContent("Field"), "entityType");
        multipart.Add(new StringContent(fieldId.ToString()), "entityId");
        multipart.Add(new StringContent("Soil sample report"), "description");

        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes("attachment-body"));
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        multipart.Add(fileContent, "file", "soil-report.txt");

        var uploadResponse = await Client.PostAsync("/api/attachments", multipart);

        uploadResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var uploaded = await uploadResponse.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        var attachmentId = uploaded.GetProperty("id").GetGuid();

        var listResponse = await Client.GetAsync($"/api/attachments?entityType=Field&entityId={fieldId}");

        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listed = await listResponse.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        listed.ValueKind.Should().Be(JsonValueKind.Array);
        listed.EnumerateArray().Any(item =>
            item.GetProperty("id").GetGuid() == attachmentId
            && item.GetProperty("fileName").GetString() == "soil-report.txt").Should().BeTrue();

        var downloadResponse = await Client.GetAsync($"/api/attachments/{attachmentId}/download");

        downloadResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        downloadResponse.Content.Headers.ContentType?.MediaType.Should().Be("text/plain");
        var downloadedBody = await downloadResponse.Content.ReadAsStringAsync();
        downloadedBody.Should().Be("attachment-body");
    }

    private async Task<Guid> CreateFieldAsync(string name)
    {
        var response = await PostAsync("/api/fields", new
        {
            name,
            areaHectares = 42.5,
            cadastralNumber = $"CAD-{Guid.NewGuid():N}".Substring(0, 20),
            soilType = "Chernozem"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var result = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions);
        return result.GetProperty("id").GetGuid();
    }
}