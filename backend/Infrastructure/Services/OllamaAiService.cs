using MoodLens.Application.Interfaces;
using MoodLens.Domain.Entities;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;

public class OllamaAiService : IOllamaAiService
{
    private readonly HttpClient _http;
    private const string BaseUrl = "http://localhost:11434";
    private const string Model_Chat = "gemma4:e2b";
    private const string Model_Analyic = "gemma4:e4b";
    //private const string Model_Analyic = "gemma4:e4b";
    //private const string Model = "gemma4:31b-cloud";


    public OllamaAiService(HttpClient http)
    {
        _http = http;
    }

    // ─── Single-turn: dùng /api/generate cho Analyze và WeeklyInsight ───────

    private async Task<string> AskOllama(string prompt)
    {
        var request = new
        {
            model = Model_Analyic,
            prompt = prompt,
            stream = false,
            num_predict = 512,
            num_ctx = 4096,
            think = false
        };
        Console.WriteLine("Model call:" + Model_Analyic.ToString());
        var response = await _http.PostAsJsonAsync(
            $"{BaseUrl}/api/generate",
            request
        );

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);

        if (!doc.RootElement.TryGetProperty("response", out var responseProp))
            throw new Exception("Ollama /api/generate không trả về 'response': " + json);

        return responseProp.GetString() ?? "";
    }

    // ─── Multi-turn: dùng /api/chat cho AI Coach với history ────────────────

    private async Task<string> AskOllamaChat(
        IEnumerable<object> messages)
    {
        var request = new
        {
            model = Model_Chat,
            messages = messages,
            stream = false,
            num_predict = 512,
            num_ctx = 4096,
            think = false
        };
        Console.WriteLine("Model call:" + Model_Chat.ToString());
        var response = await _http.PostAsJsonAsync(
            $"{BaseUrl}/api/chat",
            request
        );

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);

        // /api/chat trả về: { "message": { "role": "assistant", "content": "..." } }
        if (!doc.RootElement.TryGetProperty("message", out var messageProp) ||
            !messageProp.TryGetProperty("content", out var contentProp))
            throw new Exception("Ollama /api/chat không trả về 'message.content': " + json);

        return contentProp.GetString() ?? "";
    }

    // ─── Phân tích mood từ nhật ký ───────────────────────────────────────────

    public async Task<MoodAnalysis> Analyze(string text)
    {
        var prompt = $@"
Bạn là AI Coach của ứng dụng MoodLens.

Phân tích nội dung nhật ký và trả về:

- Mood
- Score
- Summary

Quy tắc:

0-20 = sad
21-50 = stress
51-80 = neutral
81-100 = happy

Yêu cầu Summary:

- Tối đa 200 từ.
- Thể hiện sự đồng cảm.
- Tóm tắt ngắn gọn nguyên nhân cảm xúc.
- Đưa ra 1 lời khuyên thực tế hoặc tích cực nếu phù hợp.
- Không dùng ngôn ngữ sáo rỗng.
- Không phán xét người viết.

Chỉ trả về JSON hợp lệ:

{{
  ""Mood"": ""happy | sad | stress | neutral"",
  ""Score"": 0,
  ""Summary"": """"
}}

Journal:

{text}
";
        var result = await AskOllama(prompt);
        var extracted = ExtractJson(result);
        return JsonSerializer.Deserialize<MoodAnalysis>(extracted)!;
    }

    // ─── Báo cáo weekly insight ──────────────────────────────────────────────

    public async Task<string> AI_ReportWeeklyInsight(string journals)
    {
        var prompt = $@"
Bạn là một chuyên gia tâm lý và huấn luyện viên phát triển bản thân.

Dựa trên các nhật ký dưới đây của người dùng trong tuần này, hãy phân tích xu hướng cảm xúc của họ.

Thông tin nhật ký:

{journals}

Yêu cầu:

Xác định cảm xúc nổi bật nhất trong tuần.
Nhận xét xu hướng cảm xúc đang cải thiện hay xấu đi.
Nêu 1-2 nguyên nhân có thể ảnh hưởng đến cảm xúc.
Đưa ra một lời khuyên ngắn gọn, tích cực và thực tế.
Viết bằng tiếng Việt tự nhiên, thân thiện.
Không dùng markdown.
Không dùng bullet list.
Độ dài tối đa 200 từ.

Chỉ trả về phần nhận xét cuối cùng để hiển thị cho người dùng.


Bạn chỉ được phép hỗ trợ:

- cảm xúc
- tâm trạng
- nhật ký
- sức khỏe tinh thần

Nếu câu hỏi không liên quan đến các chủ đề trên:

Hãy trả lời chính xác:

""Tôi là AI Coach của MoodLens và chỉ hỗ trợ các vấn đề liên quan đến cảm xúc, tâm trạng và nhật ký cá nhân.""

";

        return await AskOllama(prompt);
    }

    // ─── AI Coach với memory (multi-turn) ───────────────────────────────────

    public async Task<string> AI_Coach(
        string contextText,
        string question,
        List<(string Role, string Content)>? chatHistory = null)
    {
        // System message: định nghĩa nhân vật và dữ liệu nhật ký
        var systemMessage = new
        {
            role = "system",
            content = $"""
Bạn là AI Coach của MoodLens — một người bạn đồng hành tâm lý thân thiện và đồng cảm.

Mục tiêu:
- Giúp người dùng hiểu cảm xúc của chính họ.
- Đưa ra góc nhìn tích cực, thực tế và cân bằng.
- Khuyến khích người dùng tự phản chiếu cảm xúc.

Quy tắc:
- Chỉ sử dụng thông tin từ nhật ký được cung cấp.
- Không bịa đặt sự kiện hoặc thông tin không có trong nhật ký.
- Không suy diễn quá mức.
- Không đóng vai bác sĩ hoặc chuyên gia chẩn đoán bệnh.
- Không cổ vũ hành vi nguy hiểm hoặc tiêu cực.
- Không để cuộc trò chuyện đi quá xa khỏi chủ đề cảm xúc và sức khỏe tinh thần.
- Nếu người dùng hỏi nội dung không liên quan đến cảm xúc hoặc nhật ký, hãy nhẹ nhàng đưa cuộc trò chuyện trở lại việc hỗ trợ cảm xúc.

Cách trả lời:
- Trả lời bằng tiếng Việt tự nhiên.
- Giọng văn thân thiện, đồng cảm.
- Trả lời ngắn gọn và dễ hiểu.
- Tập trung vào cảm xúc hiện tại của người dùng.
- Độ dài tối đa 200 từ.
- Nếu câu trả lời vượt quá 200 từ, hãy tự tóm tắt ngắn gọn hơn. Không được dừng giữa câu. Luôn kết thúc đầy đủ ý.

======== NHẬT KÝ CỦA NGƯỜI DÙNG ========

{contextText}

========================================
"""
        };

        // Ghép lịch sử chat cũ (tối đa 3 lượt gần nhất để tránh vượt context)
        var historyMessages = (chatHistory ?? new())
            .TakeLast(3)
            .Select(m => new { role = m.Role, content = m.Content });

        // Câu hỏi mới nhất của user
        var userMessage = new { role = "user", content = question };

        // Gộp thành messages array: system → history → user mới
        var allMessages = new List<object> { systemMessage };
        allMessages.AddRange(historyMessages.Cast<object>());
        allMessages.Add(userMessage);

        return await AskOllamaChat(allMessages);
    }

    // ─── Helper: trích xuất JSON từ output của AI ────────────────────────────

    public static string ExtractJson(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return "";

        int startIndex = input.IndexOf('{');
        int endIndex = input.LastIndexOf('}');

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
            return input.Substring(startIndex, endIndex - startIndex + 1);

        return "";
    }
}
