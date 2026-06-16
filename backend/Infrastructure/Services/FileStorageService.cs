using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

public class FileStorageService
    : IFileStorageService
{
    private readonly IWebHostEnvironment _env;

    public FileStorageService(
        IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveAsync(
        IFormFile file)
    {
        var uploadsFolder =
            Path.Combine(
                _env.WebRootPath,
                "uploads",
                "snapshots");

        Directory.CreateDirectory(
            uploadsFolder);

        var fileName =
            $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

        var path =
            Path.Combine(
                uploadsFolder,
                fileName);

        await using var stream =
            new FileStream(path, FileMode.Create);

        await file.CopyToAsync(stream);

        return $"/uploads/snapshots/{fileName}";
    }
}