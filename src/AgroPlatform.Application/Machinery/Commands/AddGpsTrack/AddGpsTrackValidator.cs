using FluentValidation;

namespace AgroPlatform.Application.Machinery.Commands.AddGpsTrack;

public class AddGpsTrackValidator : AbstractValidator<AddGpsTrackCommand>
{
    public AddGpsTrackValidator()
    {
        RuleFor(x => x.MachineId).NotEmpty();
        RuleFor(x => x.Lat).InclusiveBetween(-90, 90);
        RuleFor(x => x.Lng).InclusiveBetween(-180, 180);
        RuleFor(x => x.Speed).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FuelLevel).GreaterThanOrEqualTo(0);
    }
}
