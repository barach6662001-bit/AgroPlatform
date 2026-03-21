using FluentValidation;

namespace AgroPlatform.Application.Machinery.Commands.IngestTeltonikaWebhook;

public class IngestTeltonikaWebhookValidator : AbstractValidator<IngestTeltonikaWebhookCommand>
{
    public IngestTeltonikaWebhookValidator()
    {
        RuleFor(x => x.Imei)
            .NotEmpty()
            .Matches(@"^\d{15}$")
            .WithMessage("IMEI must be exactly 15 digits.");

        RuleFor(x => x.Latitude)
            .Must(v => !double.IsNaN(v) && !double.IsInfinity(v))
            .WithMessage("Latitude must be a finite number.")
            .InclusiveBetween(-90.0, 90.0)
            .WithMessage("Latitude must be between -90 and 90.");

        RuleFor(x => x.Longitude)
            .Must(v => !double.IsNaN(v) && !double.IsInfinity(v))
            .WithMessage("Longitude must be a finite number.")
            .InclusiveBetween(-180.0, 180.0)
            .WithMessage("Longitude must be between -180 and 180.");

        RuleFor(x => x.Speed)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Speed must be non-negative.");

        RuleFor(x => x.FuelLevel)
            .GreaterThanOrEqualTo(0)
            .WithMessage("FuelLevel must be non-negative.");

        RuleFor(x => x.TimestampUtc)
            .NotEqual(default(DateTime))
            .WithMessage("TimestampUtc must not be the default DateTime value.");
    }
}
