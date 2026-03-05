using AgroPlatform.Application.Warehouses.Commands.TransferStock;
using FluentValidation.TestHelper;

namespace AgroPlatform.UnitTests.Warehouses;

public class TransferStockValidatorTests
{
    private readonly TransferStockValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        var command = new TransferStockCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), null, 10m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptySourceWarehouseId_FailsValidation()
    {
        var command = new TransferStockCommand(Guid.Empty, Guid.NewGuid(), Guid.NewGuid(), null, 10m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.SourceWarehouseId);
    }

    [Fact]
    public void Validate_EmptyDestinationWarehouseId_FailsValidation()
    {
        var command = new TransferStockCommand(Guid.NewGuid(), Guid.Empty, Guid.NewGuid(), null, 10m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.DestinationWarehouseId);
    }

    [Fact]
    public void Validate_EmptyItemId_FailsValidation()
    {
        var command = new TransferStockCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.Empty, null, 10m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ItemId);
    }

    [Fact]
    public void Validate_ZeroQuantity_FailsValidation()
    {
        var command = new TransferStockCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), null, 0m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Quantity);
    }

    [Fact]
    public void Validate_NegativeQuantity_FailsValidation()
    {
        var command = new TransferStockCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), null, -5m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Quantity);
    }

    [Fact]
    public void Validate_EmptyUnitCode_FailsValidation()
    {
        var command = new TransferStockCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), null, 10m, "", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.UnitCode);
    }

    [Fact]
    public void Validate_UnitCodeTooLong_FailsValidation()
    {
        var command = new TransferStockCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), null, 10m, new string('k', 21), null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.UnitCode);
    }
}
