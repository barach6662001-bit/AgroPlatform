namespace AgroPlatform.Application.Common.Exceptions;

public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "Access is forbidden.") : base(message) { }
}
