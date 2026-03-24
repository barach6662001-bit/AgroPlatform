namespace AgroPlatform.Application.Economics.DTOs;

/// <summary>Unified breakdown of economics data aggregated by category.</summary>
public record EconomicsByCategoryDto(string Category, decimal Amount, int Count);
