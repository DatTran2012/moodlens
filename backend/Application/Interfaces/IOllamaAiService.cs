
using MoodLens.Domain.Entities;

namespace MoodLens.Application.Interfaces
{
    public interface IOllamaAiService
    {
        Task<MoodAnalysis> Analyze(string text);
        Task<string> AI_ReportWeeklyInsight(string journals);
        Task<string> AI_Coach(string contextText, string question, List<(string Role, string Content)>? chatHistory = null);
    }
}
