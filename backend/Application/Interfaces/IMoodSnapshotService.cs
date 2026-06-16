using Microsoft.AspNetCore.Http;
public interface IMoodSnapshotService
{
    Task<MoodSnapshotDto> CreateAsync(
        Guid userId,
        IFormFile file,
        CreateMoodSnapshotRequest request);

    Task<List<MoodSnapshotDto>> GetTimelineAsync(
        Guid userId);
    Task DeleteAsync(
    Guid userId,
    Guid snapshotId);
}