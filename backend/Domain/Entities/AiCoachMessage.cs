public class AiCoachMessage
{
    public Guid Id { get; set; }

    public Guid ConversationId { get; set; }

    public AiCoachConversation Conversation
    {
        get;
        set;
    }

    public string Role { get; set; } = "";

    public string Content { get; set; } = "";

    public DateTime CreatedAt { get; set; }
}