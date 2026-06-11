using Microsoft.EntityFrameworkCore;
using MoodLens.Application.DTOs.Dashboard;
using MoodLens.Domain.Entities;
using MoodLens.Persistence.Context;

namespace MoodLens.Infrastructure.Services;

public class DashboardService
{
    private readonly MoodLensDbContext _context;

    public DashboardService(MoodLensDbContext context)
    {
        _context = context;
    }

    // 📊 Mood stats
    public MoodStatsDto GetMoodStats(Guid userId)
    {
        DateTime today = DateTime.UtcNow.Date; // 00:00:00
        DateTime tomorrow = today.AddDays(1); // 00:00:00 ngày mai
        var moods = _context.MoodAnalyses
            .Where(x => x.JournalEntry.UserId == userId && x.CreatedAt >= today && x.CreatedAt < tomorrow)
            .ToList();

        return new MoodStatsDto
        {
            Happy = moods.Count(x => x.Mood.ToLower() == "happy"),
            Stress = moods.Count(x => x.Mood.ToLower() == "stress"),
            Sad = moods.Count(x => x.Mood.ToLower() == "sad"),
            Neutral = moods.Count(x => x.Mood.ToLower() == "neutral")
        };
    }

    // 📈 Mood by date
    public List<MoodByDateDto> GetMoodByDate(Guid userId)
    {
        return _context.MoodAnalyses
            .Where(x => x.JournalEntry.UserId == userId)
            .Select(x => new MoodByDateDto
            {
                Date = x.CreatedAt.Date,
                Mood = x.Mood
            })
            .OrderBy(x => x.Date)
            .ToList();
    }
}