# Таск 019: Feature: weather widget OpenWeatherMap

## Backend

Створити `src/AgroPlatform.Api/Controllers/WeatherController.cs`:
```csharp
[ApiController]
[Route("api/weather")]
public class WeatherController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    public WeatherController(IHttpClientFactory f) { _httpClientFactory = f; }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrent([FromQuery] double lat, [FromQuery] double lon, CancellationToken ct)
    {
        var key = Environment.GetEnvironmentVariable("OPENWEATHER_API_KEY") ?? "";
        if (string.IsNullOrEmpty(key)) return Ok(new { error = "API key not configured" });
        var http = _httpClientFactory.CreateClient();
        var r = await http.GetStringAsync($"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=metric&lang=uk", ct);
        return Content(r, "application/json");
    }

    [HttpGet("forecast")]
    public async Task<IActionResult> GetForecast([FromQuery] double lat, [FromQuery] double lon, CancellationToken ct)
    {
        var key = Environment.GetEnvironmentVariable("OPENWEATHER_API_KEY") ?? "";
        if (string.IsNullOrEmpty(key)) return Ok(new { error = "API key not configured" });
        var http = _httpClientFactory.CreateClient();
        var r = await http.GetStringAsync($"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={key}&units=metric&lang=uk", ct);
        return Content(r, "application/json");
    }
}
```

## Frontend

Створити `frontend/src/components/WeatherWidget.tsx` — картка з поточною погодою (температура, вологість, вітер, іконка). Додати на Dashboard.tsx.

## Коміт
```bash
dotnet build src/AgroPlatform.Api/AgroPlatform.Api.csproj --no-restore --configuration Release
cd frontend && npx tsc --noEmit && cd ..
git add -A
git commit -m "Feature: weather widget OpenWeatherMap"
git push origin main
```
