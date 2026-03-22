using FluentValidation;

namespace AgroPlatform.Application.Machinery.Commands.IngestGpsWebhook;

public class IngestGpsWebhookValidator : AbstractValidator<IngestGpsWebhookCommand>
{
    public IngestGpsWebhookValidator()
    {
        RuleFor(x => x.DeviceId)
            .NotEmpty()
            .WithMessage("DeviceId is required.");

        RuleFor(x => x.Lat)
            .Must(v => !double.IsNaN(v) && !double.IsInfinity(v))
            .WithMessage("Lat must be a finite number.")
            .InclusiveBetween(-90.0, 90.0)
            .WithMessage("Lat must be between -90 and 90.");

        RuleFor(x => x.Lon)
            .Must(v => !double.IsNaN(v) && !double.IsInfinity(v))
            .WithMessage("Lon must be a finite number.")
            .InclusiveBetween(-180.0, 180.0)
            .WithMessage("Lon must be between -180 and 180.");

        RuleFor(x => x.Speed)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Speed must be non-negative.");

        RuleFor(x => x.Timestamp)
            .NotEqual(default(DateTime))
            .WithMessage("Timestamp must not be the default DateTime value.");

        RuleFor(x => x.Fuel)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Fuel.HasValue)
            .WithMessage("Fuel must be non-negative.");

        RuleFor(x => x.Heading)
            .InclusiveBetween(0.0, 360.0)
            .When(x => x.Heading.HasValue)
            .WithMessage("Heading must be between 0 and 360.");
    }
}
