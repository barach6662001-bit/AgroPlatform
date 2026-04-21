using AgroPlatform.Application.Warehouses.Commands.IssueStock;
using FluentValidation.TestHelper;

namespace AgroPlatform.UnitTests.Warehouses;

public class IssueStockValidatorTests
{
    private readonly IssueStockValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        var command = new IssueStockCommand(Guid.NewGuid(), Guid.NewGuid(), null, 10m, "kg", null, null, null, null);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyWarehouseId_FailsValidation()
    {
        var command = new IssueStockCommand(Guid.Empty, Guid.NewGuid(), null, 10m, "kg", null, null, null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.WarehouseId);
    }

    [Fact]
    public void Validate_EmptyItemId_FailsValidation()
    {
        var command = new IssueStockCommand(Guid.NewGuid(), Guid.Empty, null, 10m, "kg", null, null, null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ItemId);
    }

    [Fact]
    public void Validate_ZeroQuantity_FailsValidation()
    {
        var command = new IssueStockCommand(Guid.NewGuid(), Guid.NewGuid(), null, 0m, "kg", null, null, null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Quantity);
    }

    [Fact]
    public void Validate_NegativeQuantity_FailsValidation()
    {
        var command = new IssueStockCommand(Guid.NewGuid(), Guid.NewGuid(), null, -5m, "kg", null, null, null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Quantity);
    }

    [Fact]
    public void Validate_EmptyUnitCode_FailsValidation()
    {
        var command = new IssueStockCommand(Guid.NewGuid(), Guid.NewGuid(), null, 10m, "", null, null, null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.UnitCode);
    }

    [Fact]
    public void Validate_UnitCodeTooLong_FailsValidation()
    {
        var command = new IssueStockCommand(Guid.NewGuid(), Guid.NewGuid(), null, 10m, new string('k', 21), null, null, null, null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.UnitCode);
    }
}
