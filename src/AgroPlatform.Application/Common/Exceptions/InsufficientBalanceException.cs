namespace AgroPlatform.Application.Common.Exceptions;

public class InsufficientBalanceException : ConflictException
{
    public InsufficientBalanceException(Guid warehouseId, Guid itemId, decimal requested, decimal available)
        : base($"Insufficient balance at warehouse {warehouseId} for item {itemId}. Requested: {requested}, Available: {available}") { }
}
