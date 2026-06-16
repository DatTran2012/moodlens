public class MoodSnapshotDto
{
    public Guid Id { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string Mood { get; set; } = string.Empty;

    public string? Caption { get; set; }

    public DateTime CreatedAt { get; set; }
}