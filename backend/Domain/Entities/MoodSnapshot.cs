namespace MoodLens.Domain.Entities;

public class MoodSnapshot
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string Mood { get; set; } = string.Empty;

    public string? Caption { get; set; }

    public string? AiEmotion { get; set; }

    public int? AiScore { get; set; }

    public string? AiInsight { get; set; }

    public string? AiReflection { get; set; }

    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}