using System.Threading.Tasks;

namespace MoodLens.Application.Interfaces
{
    public interface IWeeklyInsightService
    {
        Task RegenerateAsync(Guid userId);
    }
}
