using MoodLens.Application.Interfaces;
using MoodLens.Domain.Entities;
using System.Net.Http.Json;
using System.Text.Json;

public class OllamaAiService : IOllamaAiService
{
    private readonly HttpClient _http;
    private const string BaseUrl = "http://localhost:11434";
    private const string Model = "gemma4";

    public OllamaAiService(HttpClient http)
    {
        _http = http;
    }

    // ─── Single-turn: dùng /api/generate cho Analyze và WeeklyInsight ───────

    private async Task<string> AskOllama(string prompt)
    {
        var request = new
        {
            model = Model,
            prompt = prompt,
            stream = false
        };

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
            model = Model,
            messages = messages,
            stream = false
        };

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

- Tối đa 300 từ.
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
Độ dài tối đa 300 từ.

Chỉ trả về phần nhận xét cuối cùng để hiển thị cho người dùng.";

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
Bạn là AI Coach của MoodLens — một người bạn đồng hành tâm lý thân thiện.

Nguyên tắc:
- Không bịa dữ liệu.
- Chỉ dùng thông tin từ nhật ký dưới đây.
- Trả lời tiếng Việt, thân thiện, đồng cảm, dưới 300 từ.

======== NHẬT KÝ CỦA NGƯỜI DÙNG ========

{contextText}

=========================================
"""
        };

        // Ghép lịch sử chat cũ (tối đa 10 lượt gần nhất để tránh vượt context)
        var historyMessages = (chatHistory ?? new())
            .TakeLast(10)
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
