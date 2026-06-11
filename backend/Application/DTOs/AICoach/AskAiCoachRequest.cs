public class AskAiCoachRequest
{
    public Guid ConversationId
    {
        get;
        set;
    }

    public string Question
    {
        get;
        set;
    } = "";
}