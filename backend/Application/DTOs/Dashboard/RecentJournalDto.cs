public class RecentJournalDto
{
    public Guid Id { get; set; }

    public string Content { get; set; } = "";

    public string Mood { get; set; } = "";

    public DateTime CreatedAt { get; set; }
}