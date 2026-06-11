namespace MoodLens.Application.DTOs.Dashboard;

public class MoodByDateDto
{
    public DateTime Date { get; set; }
    public string Mood { get; set; } = string.Empty;
}