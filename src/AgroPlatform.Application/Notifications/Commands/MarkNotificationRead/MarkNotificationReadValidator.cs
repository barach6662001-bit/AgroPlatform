using FluentValidation;

namespace AgroPlatform.Application.Notifications.Commands.MarkNotificationRead;

public class MarkNotificationReadValidator : AbstractValidator<MarkNotificationReadCommand>
{
    public MarkNotificationReadValidator()
    {
        // Id is nullable — when null, marks all notifications as read
        RuleFor(x => x.Id).NotEmpty().When(x => x.Id.HasValue);
    }
}
