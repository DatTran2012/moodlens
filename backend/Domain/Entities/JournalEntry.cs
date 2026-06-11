using MoodLens.Domain.Common;

namespace MoodLens.Domain.Entities;

public class JournalEntry : BaseEntity
{
    public Guid UserId { get; set; }

    public string Content { get; set; } = string.Empty;

    public User User { get; set; }
    public MoodAnalysis MoodAnalysis { get; set; } // 1 bài nhật ký có 1 phân tích tâm trạng
}
