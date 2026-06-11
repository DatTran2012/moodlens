public class DashboardResponseDto
{
    public int TotalJournals { get; set; }

    public double AverageScore { get; set; }

    public string TopMood { get; set; } = "";

    public int WeeklyCount { get; set; }

    public int Happy { get; set; }

    public int Stress { get; set; }

    public int Sad { get; set; }

    public int Neutral { get; set; }
    public string WeeklyInsight
    {
        get;
        set;
    } = "";

    public int CurrentStreak { get; set; }
    public List<MoodTrendDto> Trend { get; set; } = [];

    public List<MoodDistributionDto> Distribution { get; set; } = [];

    public List<RecentJournalDto> Recent { get; set; } = [];

    public List<MoodCalendarDto> Calendar { get; set; }
    = new();

    public List<AchievementDto> Achievements { get; set; }
    = new();
}