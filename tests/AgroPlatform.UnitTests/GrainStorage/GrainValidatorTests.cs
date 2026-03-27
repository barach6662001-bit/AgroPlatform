using AgroPlatform.Application.GrainStorage.Commands.AdjustGrainBatch;
using AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;
using AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;
using AgroPlatform.Application.GrainStorage.Commands.TransferGrain;
using AgroPlatform.Application.GrainStorage.Commands.WriteOffGrainBatch;
using AgroPlatform.Domain.Enums;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace AgroPlatform.UnitTests.GrainStorage;

public class GrainValidatorTests
{
    // ── TransferGrainValidator ────────────────────────────────────────────

    [Fact]
    public void TransferGrain_EmptySourceBatchId_HasError()
    {
        var validator = new TransferGrainValidator();
        var command = new TransferGrainCommand(Guid.Empty, Guid.NewGuid(), 10m);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.SourceBatchId);
    }

    [Fact]
    public void TransferGrain_EmptyTargetBatchId_HasError()
    {
        var validator = new TransferGrainValidator();
        var command = new TransferGrainCommand(Guid.NewGuid(), Guid.Empty, 10m);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.TargetBatchId);
    }

    [Fact]
    public void TransferGrain_ZeroQuantity_HasError()
    {
        var validator = new TransferGrainValidator();
        var command = new TransferGrainCommand(Guid.NewGuid(), Guid.NewGuid(), 0m);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.QuantityTons);
    }

    [Fact]
    public void TransferGrain_NegativeQuantity_HasError()
    {
        var validator = new TransferGrainValidator();
        var command = new TransferGrainCommand(Guid.NewGuid(), Guid.NewGuid(), -5m);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.QuantityTons);
    }

    [Fact]
    public void TransferGrain_SameSourceAndTarget_HasError()
    {
        var validator = new TransferGrainValidator();
        var id = Guid.NewGuid();
        var command = new TransferGrainCommand(id, id, 10m);
        var result = validator.TestValidate(command);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void TransferGrain_ValidCommand_NoErrors()
    {
        var validator = new TransferGrainValidator();
        var command = new TransferGrainCommand(Guid.NewGuid(), Guid.NewGuid(), 10m);
        validator.TestValidate(command).ShouldNotHaveAnyValidationErrors();
    }

    // ── CreateGrainMovementValidator ──────────────────────────────────────

    [Fact]
    public void CreateGrainMovement_EmptyBatchId_HasError()
    {
        var validator = new CreateGrainMovementValidator();
        var command = new CreateGrainMovementCommand(Guid.Empty, GrainMovementType.Receipt, 10m, DateTime.Today, null, null);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.GrainBatchId);
    }

    [Fact]
    public void CreateGrainMovement_ZeroQuantity_HasError()
    {
        var validator = new CreateGrainMovementValidator();
        var command = new CreateGrainMovementCommand(Guid.NewGuid(), GrainMovementType.Receipt, 0m, DateTime.Today, null, null);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.QuantityTons);
    }

    [Fact]
    public void CreateGrainMovement_DefaultDate_HasError()
    {
        var validator = new CreateGrainMovementValidator();
        var command = new CreateGrainMovementCommand(Guid.NewGuid(), GrainMovementType.Receipt, 10m, default, null, null);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.MovementDate);
    }

    [Fact]
    public void CreateGrainMovement_ValidCommand_NoErrors()
    {
        var validator = new CreateGrainMovementValidator();
        var command = new CreateGrainMovementCommand(Guid.NewGuid(), GrainMovementType.Receipt, 50m, DateTime.Today, null, null);
        validator.TestValidate(command).ShouldNotHaveAnyValidationErrors();
    }

    // ── AdjustGrainBatchValidator ─────────────────────────────────────────

    [Fact]
    public void AdjustGrainBatch_EmptyBatchId_HasError()
    {
        var validator = new AdjustGrainBatchValidator();
        var command = new AdjustGrainBatchCommand(Guid.Empty, 10m, null, null, null);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.BatchId);
    }

    [Fact]
    public void AdjustGrainBatch_ZeroAdjustment_HasError()
    {
        var validator = new AdjustGrainBatchValidator();
        var command = new AdjustGrainBatchCommand(Guid.NewGuid(), 0m, null, null, null);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.AdjustmentTons);
    }

    [Fact]
    public void AdjustGrainBatch_ValidPositive_NoErrors()
    {
        var validator = new AdjustGrainBatchValidator();
        var command = new AdjustGrainBatchCommand(Guid.NewGuid(), 10m, "reweigh", null, null);
        validator.TestValidate(command).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void AdjustGrainBatch_ValidNegative_NoErrors()
    {
        var validator = new AdjustGrainBatchValidator();
        var command = new AdjustGrainBatchCommand(Guid.NewGuid(), -5m, "shrinkage", null, null);
        validator.TestValidate(command).ShouldNotHaveAnyValidationErrors();
    }

    // ── WriteOffGrainBatchValidator ───────────────────────────────────────

    [Fact]
    public void WriteOffGrainBatch_EmptyBatchId_HasError()
    {
        var validator = new WriteOffGrainBatchValidator();
        var command = new WriteOffGrainBatchCommand(Guid.Empty, 10m, null, null, null);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.BatchId);
    }

    [Fact]
    public void WriteOffGrainBatch_ZeroQuantity_HasError()
    {
        var validator = new WriteOffGrainBatchValidator();
        var command = new WriteOffGrainBatchCommand(Guid.NewGuid(), 0m, null, null, null);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.QuantityTons);
    }

    [Fact]
    public void WriteOffGrainBatch_NegativeQuantity_HasError()
    {
        var validator = new WriteOffGrainBatchValidator();
        var command = new WriteOffGrainBatchCommand(Guid.NewGuid(), -10m, null, null, null);
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.QuantityTons);
    }

    [Fact]
    public void WriteOffGrainBatch_ValidCommand_NoErrors()
    {
        var validator = new WriteOffGrainBatchValidator();
        var command = new WriteOffGrainBatchCommand(Guid.NewGuid(), 50m, "damage", null, null);
        validator.TestValidate(command).ShouldNotHaveAnyValidationErrors();
    }

    // ── SplitGrainBatchValidator ──────────────────────────────────────────

    [Fact]
    public void SplitGrainBatch_EmptySourceBatchId_HasError()
    {
        var validator = new SplitGrainBatchValidator();
        var command = new SplitGrainBatchCommand(Guid.Empty, 10m, Guid.NewGuid());
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.SourceBatchId);
    }

    [Fact]
    public void SplitGrainBatch_ZeroQuantity_HasError()
    {
        var validator = new SplitGrainBatchValidator();
        var command = new SplitGrainBatchCommand(Guid.NewGuid(), 0m, Guid.NewGuid());
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.SplitQuantityTons);
    }

    [Fact]
    public void SplitGrainBatch_NegativeQuantity_HasError()
    {
        var validator = new SplitGrainBatchValidator();
        var command = new SplitGrainBatchCommand(Guid.NewGuid(), -5m, Guid.NewGuid());
        validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.SplitQuantityTons);
    }

    [Fact]
    public void SplitGrainBatch_ValidCommand_NoErrors()
    {
        var validator = new SplitGrainBatchValidator();
        var command = new SplitGrainBatchCommand(Guid.NewGuid(), 100m, Guid.NewGuid());
        validator.TestValidate(command).ShouldNotHaveAnyValidationErrors();
    }
}
