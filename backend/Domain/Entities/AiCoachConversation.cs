public class AiCoachConversation
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Title { get; set; } = "";

    public DateTime CreatedAt { get; set; }
    public bool IsPinned { get; set; }

    public ICollection<AiCoachMessage>
        Messages
    {
        get;
        set;
    } = new List<AiCoachMessage>();
}