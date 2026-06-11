using MoodLens.Domain.Entities;

namespace MoodLens.Infrastructure.Services;

public class AiMoodService
{
    public MoodAnalysis Analyze(string journalText)
    {
        var lower = journalText.ToLower();

        if (lower.Contains("stress") || lower.Contains("mệt"))
        {
            return new MoodAnalysis
            {
                Mood = "stress",
                Score = 30,
                Summary = "Bạn đang có dấu hiệu căng thẳng"
            };
        }

        if (lower.Contains("vui") || lower.Contains("happy"))
        {
            return new MoodAnalysis
            {
                Mood = "happy",
                Score = 85,
                Summary = "Tâm trạng tích cực"
            };
        }

        return new MoodAnalysis
        {
            Mood = "neutral",
            Score = 60,
            Summary = "Trạng thái ổn định"
        };
    }
}