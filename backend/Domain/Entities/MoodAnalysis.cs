using MoodLens.Domain.Common;

namespace MoodLens.Domain.Entities
{
    public class MoodAnalysis : BaseEntity
    {
        public Guid JournalEntryId { get; set; }

        public string Mood { get; set; } = string.Empty; // happy, sad, stress

        public int Score { get; set; } = 0; // 1 - 100 

        public string Summary { get; set; } = string.Empty;

        // Thuộc tính điều hướng
        public JournalEntry JournalEntry { get; set; }
    }
}
