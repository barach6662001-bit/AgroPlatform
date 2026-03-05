using AgroPlatform.Application.Common.Interfaces;

namespace AgroPlatform.Infrastructure.Services;

public class DateTimeService : IDateTimeService
{
    public DateTime UtcNow => DateTime.UtcNow;
}
