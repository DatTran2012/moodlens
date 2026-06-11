using Microsoft.Extensions.Configuration;
using MoodLens.Domain.Entities;
using System.Text;
using System.Text.Json;

public class GeminiAiService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _configuration;

    public GeminiAiService(
        HttpClient http,
        IConfiguration configuration)
    {
        _http = http;
        _configuration = configuration;
    }

    private async Task<string> AskGemini(string prompt)
    {
        var apiKey =
            _configuration["Gemini:ApiKey"];

        var url =
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

        var body = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = prompt
                        }
                    }
                }
            }
        };

        var json =
            JsonSerializer.Serialize(body);

        var response =
            await _http.PostAsync(
                url,
                new StringContent(
                    json,
                    Encoding.UTF8,
                    "application/json"));

        if (!response.IsSuccessStatusCode)
        {
            var error =
                await response.Content.ReadAsStringAsync();

            throw new Exception(
                $"Gemini Error: {response.StatusCode}\n{error}");
        }

        var result =
            await response.Content
                .ReadAsStringAsync();

        using var doc =
            JsonDocument.Parse(result);

        return doc
            .RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "";
    }

    public async Task<MoodAnalysis> Analyze(string text)
    {
        var prompt = $$"""
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

- Tối đa 100 từ
- Đồng cảm
- Không phán xét
- Có thể đưa ra lời khuyên ngắn

Chỉ trả về JSON hợp lệ:

{
  "Mood": "happy | sad | stress | neutral",
  "Score": 0,
  "Summary": ""
}

Journal:

{{text}}
""";

        var result =
            await AskGemini(prompt);

        var json =
            ExtractJson(result);

        return JsonSerializer.Deserialize<MoodAnalysis>(json)!;
    }

    public async Task<string> AI_ReportWeeklyInsight(string journals)
    {
        var prompt = $"""
Bạn là chuyên gia tâm lý.

Dựa trên các nhật ký:

{journals}

Hãy:

- Xác định cảm xúc nổi bật
- Nhận xét xu hướng
- Nêu nguyên nhân
- Đưa ra lời khuyên

Viết tiếng Việt tự nhiên.
Tối đa 120 từ.

Chỉ trả về nội dung nhận xét.
""";

        return await AskGemini(prompt);
    }

    public async Task<string> AI_Coach(
        string contextText,
        string question)
    {
        var prompt = $"""
Bạn là AI Coach của MoodLens.

Không được bịa dữ liệu.

Chỉ được dùng dữ liệu dưới đây.

======== JOURNALS ========

{contextText}

==========================

Câu hỏi:

{question}

Trả lời:

- Tiếng Việt
- Thân thiện
- Đồng cảm
- Dưới 200 từ
""";

        return await AskGemini(prompt);
    }

    public static string ExtractJson(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return "";

        int startIndex =
            input.IndexOf('{');

        int endIndex =
            input.LastIndexOf('}');

        if (
            startIndex != -1 &&
            endIndex != -1 &&
            endIndex > startIndex
        )
        {
            return input.Substring(
                startIndex,
                endIndex - startIndex + 1);
        }

        return "";
    }
}