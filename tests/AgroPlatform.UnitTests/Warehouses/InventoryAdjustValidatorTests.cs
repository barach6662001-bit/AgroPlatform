using AgroPlatform.Application.Warehouses.Commands.InventoryAdjust;
using FluentValidation.TestHelper;

namespace AgroPlatform.UnitTests.Warehouses;

public class InventoryAdjustValidatorTests
{
    private readonly InventoryAdjustValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        var command = new InventoryAdjustCommand(Guid.NewGuid(), Guid.NewGuid(), null, 100m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_ZeroActualQuantity_PassesValidation()
    {
        var command = new InventoryAdjustCommand(Guid.NewGuid(), Guid.NewGuid(), null, 0m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.ActualQuantity);
    }

    [Fact]
    public void Validate_EmptyWarehouseId_FailsValidation()
    {
        var command = new InventoryAdjustCommand(Guid.Empty, Guid.NewGuid(), null, 100m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.WarehouseId);
    }

    [Fact]
    public void Validate_EmptyItemId_FailsValidation()
    {
        var command = new InventoryAdjustCommand(Guid.NewGuid(), Guid.Empty, null, 100m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ItemId);
    }

    [Fact]
    public void Validate_NegativeActualQuantity_FailsValidation()
    {
        var command = new InventoryAdjustCommand(Guid.NewGuid(), Guid.NewGuid(), null, -1m, "kg", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ActualQuantity);
    }

    [Fact]
    public void Validate_EmptyUnitCode_FailsValidation()
    {
        var command = new InventoryAdjustCommand(Guid.NewGuid(), Guid.NewGuid(), null, 100m, "", null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.UnitCode);
    }

    [Fact]
    public void Validate_UnitCodeTooLong_FailsValidation()
    {
        var command = new InventoryAdjustCommand(Guid.NewGuid(), Guid.NewGuid(), null, 100m, new string('k', 21), null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.UnitCode);
    }
}
