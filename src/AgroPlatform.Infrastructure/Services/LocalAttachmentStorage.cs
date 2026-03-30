using AgroPlatform.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AgroPlatform.Infrastructure.Services;

public class LocalAttachmentStorage : IAttachmentStorage
{
    private readonly string _rootPath;

    public LocalAttachmentStorage(IConfiguration configuration)
    {
        var configuredRootPath = configuration["AttachmentStorage:RootPath"];
        _rootPath = Path.GetFullPath(string.IsNullOrWhiteSpace(configuredRootPath)
            ? Path.Combine(AppContext.BaseDirectory, "App_Data", "attachments")
            : configuredRootPath);

        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> SaveAsync(
        Guid tenantId,
        string entityType,
        Guid entityId,
        Guid attachmentId,
        string fileName,
        Stream content,
        CancellationToken cancellationToken = default)
    {
        var sanitizedEntityType = SanitizePathSegment(entityType);
        var sanitizedExtension = Path.GetExtension(Path.GetFileName(fileName));
        var storedFileName = string.IsNullOrWhiteSpace(sanitizedExtension)
            ? attachmentId.ToString("N")
            : $"{attachmentId:N}{sanitizedExtension.ToLowerInvariant()}";

        var relativePath = Path.Combine(
            tenantId.ToString("N"),
            sanitizedEntityType,
            entityId.ToString("N"),
            storedFileName);

        var fullPath = ResolveFullPath(relativePath);
        var directoryPath = Path.GetDirectoryName(fullPath)
            ?? throw new InvalidOperationException("Attachment directory path could not be resolved.");

        Directory.CreateDirectory(directoryPath);

        if (content.CanSeek)
        {
            content.Position = 0;
        }

        await using var fileStream = new FileStream(
            fullPath,
            FileMode.Create,
            FileAccess.Write,
            FileShare.None,
            bufferSize: 81920,
            useAsync: true);

        await content.CopyToAsync(fileStream, cancellationToken);
        return relativePath.Replace(Path.DirectorySeparatorChar, '/');
    }

    public async Task<byte[]> ReadAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var fullPath = ResolveFullPath(storagePath);
        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException("Attachment content was not found in storage.", storagePath);
        }

        return await File.ReadAllBytesAsync(fullPath, cancellationToken);
    }

    private string ResolveFullPath(string relativePath)
    {
        var normalizedPath = relativePath.Replace('/', Path.DirectorySeparatorChar);
        var combinedPath = Path.Combine(_rootPath, normalizedPath);
        var fullPath = Path.GetFullPath(combinedPath);

        if (!fullPath.StartsWith(_rootPath, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Attachment path resolves outside the configured storage root.");
        }

        return fullPath;
    }

    private static string SanitizePathSegment(string value)
    {
        var trimmedValue = value.Trim();
        var sanitizedChars = trimmedValue
            .Select(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_' ? ch : '-')
            .ToArray();

        var sanitized = new string(sanitizedChars).Trim('-');
        return string.IsNullOrWhiteSpace(sanitized) ? "entity" : sanitized;
    }
}