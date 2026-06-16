using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Npgsql.BackendMessages;
using System.Security.Principal;

public class CloudinaryFileStorageService
    : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryFileStorageService(
        IOptions<CloudinarySettings> options)
    {
        var settings = options.Value;

        var account = new Account(
            settings.CloudName,
            settings.ApiKey,
            settings.ApiSecret);

        _cloudinary = new Cloudinary(account);

        _cloudinary.Api.Secure = true;
    }

    public async Task<string> SaveAsync(
        IFormFile file)
    {
        await using var stream =
            file.OpenReadStream();

        var uploadParams =
            new ImageUploadParams
            {
                File = new FileDescription(
                    file.FileName,
                    stream),

                Folder =
                    "moodlens/snapshots"
            };

        var result =
            await _cloudinary
                .UploadAsync(uploadParams);

        if (result.Error != null)
        {
            throw new Exception(
                result.Error.Message);
        }

        return result.SecureUrl.ToString();
    }
}