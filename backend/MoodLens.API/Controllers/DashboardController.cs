using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MoodLens.Application.Interfaces;
using MoodLens.Domain.Entities;
using MoodLens.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly MoodLensDbContext _context;
    private readonly IWeeklyInsightService _weeklyInsightService;

    public DashboardController(MoodLensDbContext context, IWeeklyInsightService weeklyInsightService)
    {
        _context = context;
        _weeklyInsightService = weeklyInsightService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var userGuid = Guid.Parse(userId);

        // Tính toán độ lệch ngày so với Thứ Hai để luôn lấy Thứ Hai làm ngày đầu tuần
        int diff = (7 + (DateTime.UtcNow.Date.DayOfWeek - DayOfWeek.Monday)) % 7;
        var weekStart = DateTime.UtcNow.Date.AddDays(-1 * diff).Date;

        var journals = await _context.JournalEntries
            .Include(x => x.MoodAnalysis)
            .Where(x =>
                x.UserId == userGuid &&
                x.MoodAnalysis != null)
            .ToListAsync();

        var happy = journals.Count(x => x.MoodAnalysis!.Mood == "happy");
        var stress = journals.Count(x => x.MoodAnalysis!.Mood == "stress");
        var sad = journals.Count(x => x.MoodAnalysis!.Mood == "sad");
        var neutral = journals.Count(x => x.MoodAnalysis!.Mood == "neutral");

        var totalJournals = journals.Count;

        var averageScore = journals.Any()
            ? journals.Average(x => x.MoodAnalysis.Score)
            : 0;

        var topMood = journals
            .GroupBy(x => x.MoodAnalysis.Mood)
            .OrderByDescending(x => x.Count())
            .Select(x => x.Key)
            .FirstOrDefault() ?? "-";

        var weeklyCount = journals.Count(x => x.CreatedAt >= weekStart);

        var trend = journals
            .OrderBy(x => x.CreatedAt)
            .Select(x => new MoodTrendDto
            {
                Date = x.CreatedAt.ToString("dd/MM"),
                Score = x.MoodAnalysis.Score
            })
            .ToList();

        var distribution = journals
            .GroupBy(x => x.MoodAnalysis.Mood)
            .Select(x => new MoodDistributionDto
            {
                Mood = x.Key,
                Count = x.Count()
            })
            .ToList();

        var recent = journals
            .OrderByDescending(x => x.CreatedAt)
            .Take(3)
            .Select(x => new RecentJournalDto
            {
                Id = x.Id,
                Content = x.Content.Length > 80
                    ? x.Content[..80] + "..."
                    : x.Content,
                Mood = x.MoodAnalysis.Mood,
                CreatedAt = x.CreatedAt
            })
            .ToList();

        var calendar = journals
            .GroupBy(x => x.CreatedAt.Date)
            .Select(g => g
                .OrderByDescending(x => x.CreatedAt)
                .First())
            .Select(x => new MoodCalendarDto
            {
                Date = x.CreatedAt.Date,
                Mood = x.MoodAnalysis.Mood,
                Score = x.MoodAnalysis.Score
            })
            .OrderBy(x => x.Date)
            .ToList();

        // Tìm Insight của tuần hiện tại
        var weeklyInsight = await _context.WeeklyInsights
            .FirstOrDefaultAsync(x =>
                x.UserId == userGuid &&
                x.WeekStart == weekStart);

        // YÊU CẦU: Chỉ load/tạo tự động 1 lần mỗi tuần vào đúng 1 ngày cố định (Ví dụ: Thứ Hai)
        if (weeklyInsight == null && DateTime.UtcNow.Date.DayOfWeek == DayOfWeek.Monday)
        {
            try
            {
                await _weeklyInsightService.RegenerateAsync(userGuid);

                // Đọc lại sau khi generate xong
                weeklyInsight = await _context.WeeklyInsights
                    .FirstOrDefaultAsync(x =>
                        x.UserId == userGuid &&
                        x.WeekStart == weekStart);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi tự động tạo Weekly Insight: {ex.Message}");
            }
        }

        // Nếu chưa tới ngày tạo mới hoặc dịch vụ AI gặp sự cố, lấy tuần gần nhất hiển thị tạm
        if (weeklyInsight == null)
        {
            weeklyInsight = await _context.WeeklyInsights
                .Where(x => x.UserId == userGuid)
                .OrderByDescending(x => x.WeekStart)
                .FirstOrDefaultAsync();
        }

        var sumary = weeklyInsight?.Summary ?? "Chưa có dữ liệu. AI sẽ tổng hợp tuần mới vào Thứ Hai hàng tuần nhé!";

        var journalDates = journals
            .Select(x => x.CreatedAt.Date)
            .Distinct()
            .OrderByDescending(x => x)
            .ToList();

        int currentStreak = 0;
        var checkDate = DateTime.UtcNow.Date;

        if (!journalDates.Contains(checkDate))
        {
            checkDate = checkDate.AddDays(-1);
        }

        while (journalDates.Contains(checkDate))
        {
            currentStreak++;
            checkDate = checkDate.AddDays(-1);
        }

        var achievements = new List<AchievementDto>();

        achievements.Add(new AchievementDto
        {
            Code = "first_journal",
            Title = "Nhật ký đầu tiên",
            Icon = "📝",
            Unlocked = totalJournals >= 1
        });

        achievements.Add(new AchievementDto
        {
            Code = "journal_30",
            Title = "30 nhật ký đầu tiên",
            Icon = "📚",
            Unlocked = totalJournals >= 30
        });

        achievements.Add(new AchievementDto
        {
            Code = "streak_7",
            Title = "Chuỗi 7 ngày",
            Icon = "🔥",
            Unlocked = currentStreak >= 7
        });

        achievements.Add(new AchievementDto
        {
            Code = "streak_30",
            Title = "Chuỗi 30 ngày",
            Icon = "🚀",
            Unlocked = currentStreak >= 30
        });

        achievements.Add(new AchievementDto
        {
            Code = "streak_90",
            Title = "Chuỗi 90 ngày",
            Icon = "🔥🔥🔥",
            Unlocked = currentStreak >= 90
        });

        var last7Days = journals
            .Where(x => x.CreatedAt >= DateTime.UtcNow.Date.AddDays(-7))
            .ToList();

        var happyCount = last7Days.Count(x => x.MoodAnalysis.Mood == "happy");

        achievements.Add(new AchievementDto
        {
            Code = "happy_week",
            Title = "Tuần vui vẻ",
            Icon = "😊",
            Unlocked = happyCount >= 5
        });

        return Ok(new DashboardResponseDto
        {
            TotalJournals = totalJournals,
            AverageScore = Math.Round(averageScore, 0),
            TopMood = topMood,
            WeeklyCount = weeklyCount,

            Happy = happy,
            Stress = stress,
            Sad = sad,
            Neutral = neutral,

            CurrentStreak = currentStreak,
            Trend = trend,
            Distribution = distribution,
            Recent = recent,

            Calendar = calendar,
            WeeklyInsight = sumary,
            Achievements = achievements
        });
    }

    [HttpPost("refresh-weekly-insight")]
    public async Task<IActionResult> RefreshWeeklyInsight()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var userGuid = Guid.Parse(userId);

        // Đồng bộ cách tính đầu tuần (Thứ Hai) giống hàm Get()
        int diff = (7 + (DateTime.UtcNow.Date.DayOfWeek - DayOfWeek.Monday)) % 7;
        var weekStart = DateTime.UtcNow.Date.AddDays(-1 * diff).Date;

        // Xóa insight cũ nếu có
        var existing = await _context.WeeklyInsights
            .FirstOrDefaultAsync(x =>
                x.UserId == userGuid &&
                x.WeekStart == weekStart);

        if (existing != null)
        {
            _context.WeeklyInsights.Remove(existing);
            await _context.SaveChangesAsync();
        }

        // Generate luôn và trả về kết quả mới
        await _weeklyInsightService.RegenerateAsync(userGuid);

        var newInsight = await _context.WeeklyInsights
            .FirstOrDefaultAsync(x =>
                x.UserId == userGuid &&
                x.WeekStart == weekStart);

        return Ok(new
        {
            weeklyInsight = newInsight?.Summary ?? "Chưa có dữ liệu tuần này."
        });
    }
}