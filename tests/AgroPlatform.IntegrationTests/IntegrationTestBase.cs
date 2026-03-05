using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AgroPlatform.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.IntegrationTests;

public abstract class IntegrationTestBase
{
    protected readonly HttpClient Client;
    protected readonly CustomWebApplicationFactory<Program> Factory;
    protected static readonly Guid TenantId = CustomWebApplicationFactory<Program>.TenantId;

    protected static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter() }
    };

    protected IntegrationTestBase(CustomWebApplicationFactory<Program> factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
        Client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId.ToString());
    }

    protected async Task<HttpResponseMessage> PostAsync(string url, object body)
    {
        return await Client.PostAsJsonAsync(url, body, JsonOptions);
    }

    protected async Task<T?> GetAsync<T>(string url)
    {
        var response = await Client.GetAsync(url);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>(JsonOptions);
    }

    protected async Task<HttpResponseMessage> PutAsync(string url, object body)
    {
        return await Client.PutAsJsonAsync(url, body, JsonOptions);
    }

    protected async Task<HttpResponseMessage> DeleteAsync(string url)
    {
        return await Client.DeleteAsync(url);
    }

    protected IServiceScope CreateScope()
    {
        return Factory.Services.CreateScope();
    }

    protected AppDbContext GetDbContext(IServiceScope scope)
    {
        return scope.ServiceProvider.GetRequiredService<AppDbContext>();
    }
}
