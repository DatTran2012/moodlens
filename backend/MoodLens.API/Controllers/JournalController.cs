using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MoodLens.Domain.Entities;
using MoodLens.Persistence.Context;
using System.Security.Claims;
using MoodLens.Application.Interfaces;

namespace MoodLens.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // 👈 bắt buộc login mới dùng được
public class JournalController : ControllerBase
{
    private readonly MoodLensDbContext _context;
    private readonly IOllamaAiService _ai;
    private readonly IWeeklyInsightService _weeklyInsightService;


    public JournalController(
        MoodLensDbContext context,
        IOllamaAiService ai,
        IWeeklyInsightService weeklyInsightService)
    {
        _context = context;
        _ai = ai;
        _weeklyInsightService = weeklyInsightService;
    }

    //// =========================
    //// CREATE JOURNAL + AI ANALYZE
    //// =========================
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJournalRequest request)
    {
        // 🔐 lấy user từ JWT token
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        // 1. tạo journal
        var journal = new JournalEntry
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Parse(userId),
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.JournalEntries.Add(journal);

        // 2. AI phân tích mood
        var analysis = await _ai.Analyze(request.Content);

        analysis.Id = Guid.NewGuid();
        analysis.JournalEntryId = journal.Id;
        analysis.CreatedAt = DateTime.UtcNow;

        _context.MoodAnalyses.Add(analysis);

        // 3. save DB 
        await _context.SaveChangesAsync();

        // 4. return result
        return Ok(new
        {
            journal.Id,
            journal.Content,
            analysis.Mood,
            analysis.Score,
            analysis.Summary
        });
    }
    //// =========================
    //// STREAM CREATE (NEW)
    //// =========================
    [HttpGet]
    public IActionResult GetMyJournals()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var data = _context.JournalEntries
            .Where(x => x.UserId == Guid.Parse(userId))
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.Content,
                x.MoodAnalysis.Mood,
                x.MoodAnalysis.Summary,
                x.CreatedAt
            })
            .ToList();

        return Ok(data);
    }

    // =========================
    // REQUEST MODEL
    // =========================
    public class CreateJournalRequest
    {
        public string Content { get; set; } = string.Empty;
    }
    public class UpdateJournalRequest
    {
        public string Content { get; set; } = "";
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory(
    int page = 1,
    int pageSize = 10,
    string? mood = null,
    string? search = null,
    DateTime? date = null
)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var query = _context.JournalEntries
            .Include(x => x.MoodAnalysis)
            .Where(x => x.UserId == Guid.Parse(userId));

        if (!string.IsNullOrEmpty(mood))
            query = query.Where(x => x.MoodAnalysis.Mood == mood);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(x => x.Content.Contains(search));

        if (date.HasValue)
        {
            var startDate = DateTime.SpecifyKind(
                date.Value.Date,
                DateTimeKind.Utc);

            var endDate = startDate.AddDays(1);

            // PostgreSQL không dịch được .Date trong LINQ
            // Dùng >= và < thay vì .Date ==
            query = query.Where(x =>
                x.CreatedAt >= startDate &&
                x.CreatedAt < endDate);
        }

        query = query.OrderByDescending(x => x.CreatedAt);

        //query = query.OrderByDescending(x => x.CreatedAt);

        var total = await query.CountAsync();

        var data = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
.Select(x => new
{
    x.Id,
    x.Content,

    Mood = x.MoodAnalysis != null
        ? x.MoodAnalysis.Mood
        : "unknown",

    Score = x.MoodAnalysis != null
        ? x.MoodAnalysis.Score
        : 0,

    Summary = x.MoodAnalysis != null
        ? x.MoodAnalysis.Summary
        : "",

    x.CreatedAt
})
            .ToListAsync();

        return Ok(new
        {
            total,
            page,
            pageSize,
            data
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var journal = await _context.JournalEntries
            .Where(x => x.Id == id && x.UserId == Guid.Parse(userId))
            .Select(x => new
            {
                x.Id,
                x.Content,
                x.MoodAnalysis.Mood,
                x.MoodAnalysis.Score,
                x.MoodAnalysis.Summary,
                x.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (journal == null)
            return NotFound();

        return Ok(journal);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var journal =
            await _context.JournalEntries
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == Guid.Parse(userId));

        if (journal == null)
            return NotFound();

        _context.JournalEntries.Remove(journal);

        await _context.SaveChangesAsync();

        return Ok();
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
    Guid id,
    UpdateJournalRequest request)
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var journal =
            await _context.JournalEntries
            .Include(x => x.MoodAnalysis)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == Guid.Parse(userId));

        if (journal == null)
            return NotFound();

        journal.Content =
            request.Content;

        var aiResult =
            await _ai.Analyze(
                request.Content);

        journal.MoodAnalysis.Mood =
            aiResult.Mood;

        journal.MoodAnalysis.Score =
            aiResult.Score;

        journal.MoodAnalysis.Summary =
            aiResult.Summary;

        await _context.SaveChangesAsync();

        return Ok();
    }
}