using MoodLens.Domain.Common;

namespace MoodLens.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;


    // Thuộc tính điều hướng: 1 User có nhiều JournalEntries
    public List<JournalEntry> JournalEntries { get; set; }

}

