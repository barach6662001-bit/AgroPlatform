using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Infrastructure.Services;
using AgroPlatform.Infrastructure.Services.BackgroundJobs;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using System.Net;
using System.Text;

namespace AgroPlatform.UnitTests.Economics;

public class NbuCurrencyServiceTests
{
    private static (NbuCurrencyService svc, TestDbContext db) Build(string payload, HttpStatusCode status = HttpStatusCode.OK)
    {
        var handler = new FakeHttpHandler(payload, status);
        var http = new HttpClient(handler);

        var dbOpts = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new TestDbContext(dbOpts);

        var services = new ServiceCollection();
        services.AddSingleton<IAppDbContext>(db);
        var sp = services.BuildServiceProvider();

        var svc = new NbuCurrencyService(http, sp, NullLogger<NbuCurrencyService>.Instance);
        return (svc, db);
    }

    [Fact]
    public async Task BackfillAsync_UpsertsRatesFromNbuResponse()
    {
        const string payload = "[{\"exchangedate\":\"23.04.2026\",\"cc\":\"USD\",\"rate\":41.5}," +
                               "{\"exchangedate\":\"24.04.2026\",\"cc\":\"USD\",\"rate\":41.7}]";
        var (svc, db) = Build(payload);

        var inserted = await svc.BackfillAsync("USD", new DateOnly(2026, 4, 23), new DateOnly(2026, 4, 24));

        inserted.Should().Be(2);
        var rows = await db.ExchangeRates.OrderBy(r => r.Date).ToListAsync();
        rows.Should().HaveCount(2);
        rows[0].Code.Should().Be("USD");
        rows[0].RateToUah.Should().Be(41.5m);
        rows[1].RateToUah.Should().Be(41.7m);
    }

    [Fact]
    public async Task BackfillAsync_SecondRunUpdatesExistingRowInPlace()
    {
        const string payload1 = "[{\"exchangedate\":\"24.04.2026\",\"cc\":\"USD\",\"rate\":41.0}]";
        var (svc, db) = Build(payload1);
        await svc.BackfillAsync("USD", new DateOnly(2026, 4, 24), new DateOnly(2026, 4, 24));

        // Now swap handler payload (via reflection into svc would be ugly — recreate with same db).
        var handler2 = new FakeHttpHandler("[{\"exchangedate\":\"24.04.2026\",\"cc\":\"USD\",\"rate\":42.1}]");
        var http2 = new HttpClient(handler2);
        var services = new ServiceCollection();
        services.AddSingleton<IAppDbContext>(db);
        var sp = services.BuildServiceProvider();
        var svc2 = new NbuCurrencyService(http2, sp, NullLogger<NbuCurrencyService>.Instance);

        await svc2.BackfillAsync("USD", new DateOnly(2026, 4, 24), new DateOnly(2026, 4, 24));

        var rows = await db.ExchangeRates.ToListAsync();
        rows.Should().HaveCount(1);
        rows[0].RateToUah.Should().Be(42.1m);
    }

    [Fact]
    public async Task GetRateAsync_FallsBackToMostRecentEarlierRate_OnWeekend()
    {
        var (svc, db) = Build("[]");
        db.ExchangeRates.Add(new ExchangeRate { Code = "USD", Date = new DateOnly(2026, 4, 24), RateToUah = 41.5m });
        await db.SaveChangesAsync();

        // Request Saturday (25 Apr) → no direct row → falls back to Friday rate.
        var rate = await svc.GetRateAsync("USD", new DateOnly(2026, 4, 25));

        rate.Should().Be(41.5m);
    }

    [Fact]
    public async Task GetRateAsync_ReturnsNull_WhenNoRatesAtAllForCurrency()
    {
        var (svc, _) = Build("[]");
        var rate = await svc.GetRateAsync("GBP", new DateOnly(2026, 4, 24));
        rate.Should().BeNull();
    }

    [Fact]
    public async Task BackfillAsync_EmptyResponse_DoesNotThrow_AndInsertsNothing()
    {
        var (svc, db) = Build("[]");
        var n = await svc.BackfillAsync("USD", new DateOnly(2026, 4, 24), new DateOnly(2026, 4, 24));
        n.Should().Be(0);
        (await db.ExchangeRates.CountAsync()).Should().Be(0);
    }

    [Fact]
    public void NbuDailySyncJob_TimeUntilNext06Kyiv_IsBetween1MinuteAnd24Hours()
    {
        // Arbitrary UTC instant: 2026-04-24 12:00 UTC (15:00 Kyiv DST) → next 06:00 Kyiv is tomorrow ~15h later.
        var now = new DateTime(2026, 4, 24, 12, 0, 0, DateTimeKind.Utc);
        var delay = NbuDailySyncJob.TimeUntilNext06Kyiv(now);
        delay.Should().BeGreaterThan(TimeSpan.FromMinutes(1));
        delay.Should().BeLessThan(TimeSpan.FromHours(24));
    }

    private sealed class FakeHttpHandler : HttpMessageHandler
    {
        private readonly string _payload;
        private readonly HttpStatusCode _status;

        public FakeHttpHandler(string payload, HttpStatusCode status = HttpStatusCode.OK)
        {
            _payload = payload;
            _status = status;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            => Task.FromResult(new HttpResponseMessage(_status)
            {
                Content = new StringContent(_payload, Encoding.UTF8, "application/json"),
            });
    }
}
