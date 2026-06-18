using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MoodLens.Application.Interfaces;
using MoodLens.Domain.Entities;
using MoodLens.Persistence.Context;
using System;

public class MoodSnapshotService
    : IMoodSnapshotService
{
    private readonly MoodLensDbContext _db;
    private readonly IFileStorageService _storage;
    private readonly IOllamaAiService _ollamaAi;



    public MoodSnapshotService(
        MoodLensDbContext db,
        IFileStorageService storage,
        IOllamaAiService ollamaAi)
    {
        _db = db;
        _storage = storage;
        _ollamaAi = ollamaAi;
    }

    public async Task<MoodSnapshotDto>
        CreateAsync(
            Guid userId,
            IFormFile file,
            CreateMoodSnapshotRequest request)
    {

        var today = DateTime.UtcNow.Date;

        var alreadyExists =
            await _db.MoodSnapshots
                .AnyAsync(x =>
                    x.UserId == userId &&
                    x.CreatedAt.Date == today);

        if (alreadyExists)
        {
            throw new Exception(
                "Bạn đã tạo Snapshot hôm nay rồi.");
        }

        var imageUrl =
            await _storage.SaveAsync(file);

        using var ms =
    new MemoryStream();

        await file.CopyToAsync(ms);

        var imageBase64 =
            Convert.ToBase64String(
                ms.ToArray());

        var aiResult =
    await _ollamaAi
        .AnalyzeSnapshot(
            imageBase64,
            request.Caption,
            request.Mood);

        var snapshot =
            new MoodSnapshotDto
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ImageUrl = imageUrl,
                Mood = request.Mood,
                Caption = request.Caption,
                CreatedAt = DateTime.UtcNow,
                AiEmotion = aiResult.Emotion,
                AiScore = aiResult.Confidence,
                AiInsight = aiResult.Insight,
                AiReflection = aiResult.Reflection
            };

        _db.MoodSnapshots.Add(snapshot);

        await _db.SaveChangesAsync();

        return new MoodSnapshotDto
        {
            Id = snapshot.Id,
            ImageUrl = snapshot.ImageUrl,
            Mood = snapshot.Mood,
            Caption = snapshot.Caption,
            CreatedAt = snapshot.CreatedAt
        };
    }

    public async Task<List<MoodSnapshotDto>>
        GetTimelineAsync(Guid userId)
    {
        return await _db.MoodSnapshots
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new MoodSnapshotDto
            {
                Id = x.Id,
                ImageUrl = x.ImageUrl,
                Mood = x.Mood,
                Caption = x.Caption,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }
    public async Task DeleteAsync(
        Guid userId,
        Guid snapshotId)
    {
        var snapshot =
            await _db.MoodSnapshots
                .FirstOrDefaultAsync(x =>
                    x.Id == snapshotId &&
                    x.UserId == userId);

        if (snapshot == null)
        {
            throw new Exception(
                "Snapshot not found");
        }

        _db.MoodSnapshots.Remove(snapshot);

        await _db.SaveChangesAsync();
    }
}