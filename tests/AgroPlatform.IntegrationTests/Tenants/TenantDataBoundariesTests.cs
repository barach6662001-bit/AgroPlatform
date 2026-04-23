using System.Net;
using System.Net.Http.Json;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Sales;
using AgroPlatform.Domain.Users;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.IntegrationTests.Tenants;

[Collection("Integration Tests")]
public sealed class TenantDataBoundariesTests : IntegrationTestBase
{
    public TenantDataBoundariesTests(CustomWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetDataBoundaries_EmptyTenant_ReturnsNullBoundaries()
    {
        var tenantId = Guid.NewGuid();
        await EnsureTenantExistsAsync(tenantId);

        using var client = CreateClientForTenant(tenantId);
        var response = await client.GetAsync("/api/tenant/data-boundaries");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<TenantDataBoundariesResponse>(JsonOptions);

        payload.Should().NotBeNull();
        payload!.MinOperationDate.Should().BeNull();
        payload.MaxOperationDate.Should().BeNull();
    }

    [Fact]
    public async Task GetDataBoundaries_TenantWithData_ReturnsCombinedMinAndMax()
    {
        var tenantId = Guid.NewGuid();
        await EnsureTenantExistsAsync(tenantId);

        var minDate = new DateTime(2022, 03, 10, 0, 0, 0, DateTimeKind.Utc);
        var maxDate = new DateTime(2025, 08, 25, 0, 0, 0, DateTimeKind.Utc);

        using (var scope = CreateScope())
        {
            var db = GetDbContext(scope);

            var fieldId = Guid.NewGuid();
            db.Fields.Add(new Field
            {
                Id = fieldId,
                TenantId = tenantId,
                Name = "Boundary Field",
                AreaHectares = 10,
                CurrentCrop = CropType.Wheat,
                CurrentCropYear = 2025,
                OwnershipType = LandOwnershipType.OwnLand,
            });

            db.AgroOperations.Add(new AgroOperation
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                FieldId = fieldId,
                OperationType = AgroOperationType.Sowing,
                PlannedDate = new DateTime(2023, 04, 05, 0, 0, 0, DateTimeKind.Utc),
                CompletedDate = new DateTime(2023, 04, 06, 0, 0, 0, DateTimeKind.Utc),
                Status = OperationStatus.Completed,
            });

            db.CostRecords.Add(new CostRecord
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Category = CostCategory.Fuel,
                Amount = 1200,
                Currency = "UAH",
                Date = minDate,
                Description = "Fuel cost",
            });

            db.Sales.Add(new Sale
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Date = maxDate,
                BuyerName = "Boundary Buyer",
                Product = "Wheat",
                Quantity = 10,
                Unit = "т",
                PricePerUnit = 1000,
                TotalAmount = 10_000,
                Currency = "UAH",
            });

            await db.SaveChangesAsync();
        }

        using var client = CreateClientForTenant(tenantId);
        var response = await client.GetAsync("/api/tenant/data-boundaries");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<TenantDataBoundariesResponse>(JsonOptions);

        payload.Should().NotBeNull();
        payload!.MinOperationDate.Should().NotBeNull();
        payload.MaxOperationDate.Should().NotBeNull();
        payload.MinOperationDate!.Value.Should().Be(minDate);
        payload.MaxOperationDate!.Value.Should().Be(maxDate);
    }

    private async Task EnsureTenantExistsAsync(Guid tenantId)
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);

        var exists = await db.Tenants.AnyAsync(t => t.Id == tenantId);
        if (exists)
        {
            return;
        }

        db.Tenants.Add(new Tenant
        {
            Id = tenantId,
            Name = $"Tenant {tenantId:N}",
            IsActive = true,
        });

        await db.SaveChangesAsync();
    }

    private HttpClient CreateClientForTenant(Guid tenantId)
    {
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantId.ToString());
        client.DefaultRequestHeaders.Add("X-Test-Tenant-Id", tenantId.ToString());
        return client;
    }

    private sealed class TenantDataBoundariesResponse
    {
        public DateTime? MinOperationDate { get; set; }
        public DateTime? MaxOperationDate { get; set; }
    }
}
