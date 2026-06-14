using Microsoft.Extensions.Configuration;
using MoodLens.Application.Interfaces;
using MoodLens.Domain.Entities;
using System.Text;
using System.Text.Json;

public class GeminiAiService : IGeminiAiService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _configuration;

    // gemini-2.0-flash-lite: nhỏ, nhanh → dùng cho chat và weekly insight
    // gemini-2.5-flash: mạnh hơn → dùng cho phân tích mood (cần JSON chính xác)
    private const string Model_Chat    = "gemini-2.0-flash-lite";
    private const string Model_Analyze = "gemini-2.5-flash";

    public GeminiAiService(
        HttpClient http,
        IConfiguration configuration)
    {
        _http = http;
        _configuration = configuration;
    }

    // ─── Single-turn: dùng cho Analyze và WeeklyInsight ─────────────────────

    private async Task<string> AskGemini(string prompt, string model)
    {
        var apiKey = _configuration["Gemini:ApiKey"];
        var url    = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

        var body = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                maxOutputTokens = 512,
                temperature     = 0.7
            }
        };

        Console.WriteLine("Gemini model call: " + model);

        var response = await _http.PostAsync(
            url,
            new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json"));

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini Error: {response.StatusCode}\n{error}");
        }

        var result = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(result);

        return doc
            .RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "";
    }

    // ─── Multi-turn: dùng cho AI Coach với history ───────────────────────────

    private async Task<string> AskGeminiChat(
        string systemInstruction,
        IEnumerable<object> history,
        string userMessage)
    {
        var apiKey = _configuration["Gemini:ApiKey"];
        var url    = $"https://generativelanguage.googleapis.com/v1beta/models/{Model_Chat}:generateContent?key={apiKey}";

        // Gemini dùng cấu trúc riêng: systemInstruction + contents (history + user)
        var contents = new List<object>();

        foreach (var msg in history)
            contents.Add(msg);

        contents.Add(new
        {
            role  = "user",
            parts = new[] { new { text = userMessage } }
        });

        var body = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = systemInstruction } }
            },
            contents = contents,
            generationConfig = new
            {
                maxOutputTokens = 512,
                temperature     = 0.7
            }
        };

        Console.WriteLine("Gemini model call: " + Model_Chat);

        var response = await _http.PostAsync(
            url,
            new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json"));

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini Error: {response.StatusCode}\n{error}");
        }

        var result = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(result);

        return doc
            .RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "";
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

Chỉ trả về JSON hợp lệ, không giải thích thêm:

{{
  ""Mood"": ""happy | sad | stress | neutral"",
  ""Score"": 0,
  ""Summary"": """"
}}

Journal:

{text}
";
        var result    = await AskGemini(prompt, Model_Analyze);
        var extracted = ExtractJson(result);
        return JsonSerializer.Deserialize<MoodAnalysis>(extracted)!;
    }

    // ─── Báo cáo weekly insight ──────────────────────────────────────────────

    public async Task<string> AI_ReportWeeklyInsight(string journals)
    {
        var prompt = $@"
Bạn là chuyên gia tâm lý. Dựa trên nhật ký dưới đây, hãy viết một đoạn nhận xét ngắn về xu hướng cảm xúc của người dùng trong tuần.

Nhật ký:
{journals}

Yêu cầu: viết tiếng Việt tự nhiên, thân thiện, không dùng markdown, không dùng danh sách, tối đa 150 từ. Nêu cảm xúc nổi bật, xu hướng tốt hay xấu, và một lời khuyên tích cực. Chỉ trả về phần nhận xét.
";
        return await AskGemini(prompt, Model_Chat);
    }

    // ─── AI Coach với memory (multi-turn) ───────────────────────────────────

    public async Task<string> AI_Coach(
        string contextText,
        string question,
        List<(string Role, string Content)>? chatHistory = null)
    {
        // System instruction
        var systemInstruction = $"""
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
- Nếu người dùng hỏi nội dung không liên quan đến cảm xúc hoặc nhật ký, hãy nhẹ nhàng đưa cuộc trò chuyện trở lại việc hỗ trợ cảm xúc.

Cách trả lời:
- Trả lời bằng tiếng Việt tự nhiên.
- Giọng văn thân thiện, đồng cảm.
- Không dùng markdown, không dùng bullet list, không dùng tiêu đề.
- Trả lời ngắn gọn và dễ hiểu, tối đa 200 từ.
- Luôn kết thúc đầy đủ ý, không dừng giữa câu.

======== NHẬT KÝ CỦA NGƯỜI DÙNG ========

{contextText}

========================================
""";

        // Convert history sang format Gemini (role: user/model)
        var historyMessages = (chatHistory ?? new())
            .TakeLast(6)
            .Select(m => (object)new
            {
                // Gemini dùng "model" thay vì "assistant"
                role  = m.Role == "assistant" ? "model" : "user",
                parts = new[] { new { text = m.Content } }
            });

        return await AskGeminiChat(systemInstruction, historyMessages, question);
    }

    // ─── Helper: trích xuất JSON từ output của AI ────────────────────────────

    public static string ExtractJson(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return "";

        int startIndex = input.IndexOf('{');
        int endIndex   = input.LastIndexOf('}');

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
            return input.Substring(startIndex, endIndex - startIndex + 1);

        return "";
    }
}
