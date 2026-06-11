using Microsoft.EntityFrameworkCore;
using MoodLens.Application.Interfaces;
using MoodLens.Persistence.Context;

public class WeeklyInsightService
    : IWeeklyInsightService
{
    private readonly MoodLensDbContext _context;
    private readonly IOllamaAiService _ollama;

    public WeeklyInsightService(
        MoodLensDbContext context,
        IOllamaAiService ollama)
    {
        _context = context;
        _ollama = ollama;
    }

    public async Task RegenerateAsync(
        Guid userId)
    {
        var weekStart =
            DateTime.UtcNow.Date.AddDays(
                -(int)DateTime.UtcNow.Date.DayOfWeek);

        var journals =
            await _context.JournalEntries
            .Include(x => x.MoodAnalysis)
            .Where(x =>
                x.UserId == userId &&
                x.CreatedAt >= weekStart)
            .ToListAsync();

        if (!journals.Any())
            return;

        var journalsText =
    string.Join(
        "\n\n",
        journals.Select(x => $@"
Ngày: {x.CreatedAt:dd/MM/yyyy}

Mood: {x.MoodAnalysis.Mood}

Score: {x.MoodAnalysis.Score}

Nội dung:
{x.Content}
"));

           var summary =
            await _ollama.AI_ReportWeeklyInsight(journalsText);

        var insight =
            await _context.WeeklyInsights
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.WeekStart == weekStart);

        if (insight == null)
        {
            insight = new WeeklyInsight
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                WeekStart = weekStart,
                Summary = summary,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.WeeklyInsights.Add(
                insight);
        }
        else
        {
            insight.Summary = summary;
            insight.UpdatedAt =
                DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }
}