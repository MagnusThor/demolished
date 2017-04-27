public class ChatMessage
{
    public ChatMessage() { }

    public int Id { get; set; }
    public string Message { get; set; }

    public virtual VideoConference VideoConference { get; set; }
}
       
public class VideoConference
{
    public VideoConference()
    {
        ChatMessage = new List<ChatMessage>();
    }
    public int Id { get; set; }
    public string ConferenceName { get; set; }
    public virtual ICollection<ChatMessage> ChatMessage { get; set; }
}