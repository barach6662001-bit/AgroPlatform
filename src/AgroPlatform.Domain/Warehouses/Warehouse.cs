using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Warehouses;

public class Warehouse : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public bool IsActive { get; set; } = true;
    public int Type { get; set; } = 0;

    public ICollection<StockMove> StockMoves { get; set; } = new List<StockMove>();
    public ICollection<StockBalance> Balances { get; set; } = new List<StockBalance>();
}
