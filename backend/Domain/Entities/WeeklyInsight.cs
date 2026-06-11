using MoodLens.Domain.Entities;

public class WeeklyInsight
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public DateTime WeekStart { get; set; }

    public string Summary { get; set; } = "";

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual User User { get; set; }
}