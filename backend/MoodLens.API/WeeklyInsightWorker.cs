using Microsoft.EntityFrameworkCore;
using MoodLens.Application.Interfaces;
using MoodLens.Persistence.Context;

/// <summary>
/// Background service tự động chạy mỗi Chủ nhật 8:00 sáng (giờ VN)
/// để generate WeeklyInsight cho tất cả user có nhật kí trong tuần.
/// </summary>
public class WeeklyInsightWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<WeeklyInsightWorker> _logger;

    // Múi giờ Việt Nam
    private static readonly TimeZoneInfo VnTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");

    public WeeklyInsightWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<WeeklyInsightWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("WeeklyInsightWorker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = GetDelayUntilNextSunday();
            _logger.LogInformation(
                "WeeklyInsightWorker: chạy lại sau {hours} giờ nữa.",
                delay.TotalHours.ToString("F1"));

            await Task.Delay(delay, stoppingToken);

            if (stoppingToken.IsCancellationRequested) break;

            await RunAsync();
        }
    }

    private async Task RunAsync()
    {
        _logger.LogInformation("WeeklyInsightWorker: bắt đầu generate...");

        try
        {
            // Dùng scope riêng vì BackgroundService là Singleton
            // còn DbContext và Service là Scoped
            using var scope = _scopeFactory.CreateScope();

            var context = scope.ServiceProvider
                .GetRequiredService<MoodLensDbContext>();

            var weeklyService = scope.ServiceProvider
                .GetRequiredService<IWeeklyInsightService>();

            var weekStart = DateTime.UtcNow.Date
                .AddDays(-(int)DateTime.UtcNow.DayOfWeek);

            // Lấy danh sách user có nhật kí trong tuần này
            var userIds = await context.JournalEntries
                .Where(x => x.CreatedAt >= weekStart)
                .Select(x => x.UserId)
                .Distinct()
                .ToListAsync();

            _logger.LogInformation(
                "WeeklyInsightWorker: generate cho {count} users.", userIds.Count);

            foreach (var userId in userIds)
            {
                try
                {
                    await weeklyService.RegenerateAsync(userId);
                    _logger.LogInformation(
                        "WeeklyInsightWorker: done userId={id}", userId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "WeeklyInsightWorker: lỗi userId={id}", userId);
                }
            }

            _logger.LogInformation("WeeklyInsightWorker: hoàn thành.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "WeeklyInsightWorker: lỗi tổng.");
        }
    }

    /// <summary>
    /// Tính thời gian delay đến Chủ nhật tiếp theo lúc 08:00 sáng giờ VN.
    /// </summary>
    private static TimeSpan GetDelayUntilNextSunday()
    {
        var now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VnTimeZone);

        // Tìm Chủ nhật tiếp theo
        int daysUntilSunday = ((int)DayOfWeek.Sunday - (int)now.DayOfWeek + 7) % 7;

        // Nếu hôm nay là CN nhưng chưa đến 8h → chạy hôm nay
        // Nếu đã qua 8h → chờ CN tuần sau
        if (daysUntilSunday == 0 && now.TimeOfDay >= TimeSpan.FromHours(8))
            daysUntilSunday = 7;

        var nextRun = now.Date
            .AddDays(daysUntilSunday)
            .AddHours(8); // 08:00 sáng

        return nextRun - now;
    }
}
