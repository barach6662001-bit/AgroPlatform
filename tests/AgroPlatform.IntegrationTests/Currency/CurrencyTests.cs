using System.Net;
using System.Net.Http.Json;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Users;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.IntegrationTests.Currency;

[Collection("Integration Tests")]
public sealed class CurrencyTests : IntegrationTestBase
{
    public CurrencyTests(CustomWebApplicationFactory<Program> factory) : base(factory) { }

    private sealed record RateDto(string Code, DateOnly Date, decimal RateToUah);
    private sealed record PrefsDto(string PreferredCurrency);

    // NOTE: ExchangeRates is a global (non-tenant-scoped) table; tests in this xUnit collection
    // share a single Testcontainers Postgres instance. To avoid PK collisions between tests,
    // each test uses distinct dates far in the future and upserts idempotently.

    private async Task EnsureTestUserAsync()
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var userId = TestAuthHandler.TestUserId.ToString();
        var exists = await db.Users.IgnoreQueryFilters().AnyAsync(u => u.Id == userId);
        if (!exists)
        {
            db.Users.Add(new AppUser
            {
                Id = userId,
                UserName = "currency-test@example.com",
                NormalizedUserName = "CURRENCY-TEST@EXAMPLE.COM",
                Email = "currency-test@example.com",
                NormalizedEmail = "CURRENCY-TEST@EXAMPLE.COM",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString(),
                ConcurrencyStamp = Guid.NewGuid().ToString(),
                FirstName = "Currency",
                LastName = "Test",
                Role = UserRole.CompanyAdmin,
                TenantId = TenantId,
                IsActive = true,
            });
            await db.SaveChangesAsync();
        }
    }

    private async Task UpsertRateAsync(string code, DateOnly date, decimal rateToUah)
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var existing = await db.ExchangeRates.FirstOrDefaultAsync(r => r.Code == code && r.Date == date);
        if (existing is null)
        {
            db.ExchangeRates.Add(new ExchangeRate { Code = code, Date = date, RateToUah = rateToUah, FetchedAtUtc = DateTime.UtcNow });
        }
        else
        {
            existing.RateToUah = rateToUah;
            existing.FetchedAtUtc = DateTime.UtcNow;
        }
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task GetLatestRates_ReturnsPerCurrencyMostRecentRow()
    {
        // Use dates far in the future so this test's rows dominate.
        var d1 = new DateOnly(2099, 1, 10);
        var d2 = new DateOnly(2099, 1, 11);
        await UpsertRateAsync("USD", d1, 98.10m);
        await UpsertRateAsync("USD", d2, 99.20m);
        await UpsertRateAsync("EUR", d2, 101.30m);

        using var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId.ToString());
        var rates = await client.GetFromJsonAsync<List<RateDto>>("/api/currency/rates/latest", JsonOptions);

        rates.Should().NotBeNull();
        rates!.First(r => r.Code == "USD").RateToUah.Should().Be(99.20m);
        rates.First(r => r.Code == "EUR").RateToUah.Should().Be(101.30m);
    }

    [Fact]
    public async Task GetRate_FallsBackToPreviousBusinessDay()
    {
        // 2098-06-19 is a Friday; the next day (Saturday) has no rate.
        var friday = new DateOnly(2098, 6, 19);
        var saturday = friday.AddDays(1);
        await UpsertRateAsync("USD", friday, 41.70m);

        using var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId.ToString());
        var rate = await client.GetFromJsonAsync<RateDto>(
            $"/api/currency/rates?code=USD&date={saturday:yyyy-MM-dd}", JsonOptions);

        rate.Should().NotBeNull();
        rate!.Date.Should().Be(friday);
        rate.RateToUah.Should().Be(41.70m);
    }

    [Fact]
    public async Task GetRate_ForUah_ReturnsOne()
    {
        using var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId.ToString());
        var rate = await client.GetFromJsonAsync<RateDto>("/api/currency/rates?code=UAH&date=2026-04-25", JsonOptions);
        rate!.RateToUah.Should().Be(1m);
    }

    [Fact]
    public async Task UpdatePreferences_ValidCurrency_PersistsAndIsReadable()
    {
        await EnsureTestUserAsync();
        using var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId.ToString());

        var put = await client.PutAsJsonAsync("/api/currency/preferences", new { preferredCurrency = "USD" }, JsonOptions);
        put.StatusCode.Should().Be(HttpStatusCode.OK);

        var get = await client.GetFromJsonAsync<PrefsDto>("/api/currency/preferences", JsonOptions);
        get!.PreferredCurrency.Should().Be("USD");

        // Revert to default so this test is idempotent across repeated runs.
        var revert = await client.PutAsJsonAsync("/api/currency/preferences", new { preferredCurrency = "UAH" }, JsonOptions);
        revert.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task UpdatePreferences_InvalidCurrency_Returns400()
    {
        await EnsureTestUserAsync();
        using var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", TenantId.ToString());

        var put = await client.PutAsJsonAsync("/api/currency/preferences", new { preferredCurrency = "GBP" }, JsonOptions);
        put.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
