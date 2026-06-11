using Microsoft.Extensions.Configuration;
using MoodLens.Domain.Entities;
using System.Text;
using System.Text.Json;

public class GroqAiService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _configuration;


public GroqAiService(
    HttpClient http,
    IConfiguration configuration)
    {
        _http = http;
        _configuration = configuration;
    }

    private async Task<string> AskGroq(string prompt)
    {
        var apiKey =
            _configuration["Groq:ApiKey"];

        var model =
            _configuration["Groq:Model"];

        var request = new
        {
            model = model,

            messages = new[]
            {
            new
            {
                role = "user",
                content = prompt
            }
        },

            temperature = 0.7
        };

        var json =
            JsonSerializer.Serialize(request);

        var httpRequest =
            new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.groq.com/openai/v1/chat/completions");

        httpRequest.Headers.Add(
            "Authorization",
            $"Bearer {apiKey}");

        httpRequest.Content =
            new StringContent(
                json,
                Encoding.UTF8,
                "application/json");

        var response =
            await _http.SendAsync(httpRequest);

        if (!response.IsSuccessStatusCode)
        {
            var error =
                await response.Content.ReadAsStringAsync();

            throw new Exception(
                $"Groq Error: {response.StatusCode}\n{error}");
        }

        var result =
            await response.Content
                .ReadAsStringAsync();

        using var doc =
            JsonDocument.Parse(result);

        return doc
            .RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "";
    }

    public async Task<MoodAnalysis> Analyze(string text)
    {
        var prompt = $$"""


Bạn là AI Coach của ứng dụng MoodLens.

Phân tích nội dung nhật ký và trả về:

* Mood
* Score
* Summary

Quy tắc:

0-20 = sad
21-50 = stress
51-80 = neutral
81-100 = happy

Yêu cầu Summary:

* Tối đa 200 từ
* Đồng cảm
* Không phán xét
* Có thể đưa ra lời khuyên ngắn

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
        await AskGroq(prompt);

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

* Xác định cảm xúc nổi bật
* Nhận xét xu hướng
* Nêu nguyên nhân
* Đưa ra lời khuyên

Viết tiếng Việt tự nhiên.
Tối đa 200 từ.

Chỉ trả về nội dung nhận xét.
""";


    return await AskGroq(prompt);
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

* Tiếng Việt
* Thân thiện
* Đồng cảm
* Dưới 200 từ
""";

        return await AskGroq(prompt);

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
