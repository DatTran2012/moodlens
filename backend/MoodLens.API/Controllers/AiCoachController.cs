using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MoodLens.Application.Interfaces;
using MoodLens.Persistence.Context;
using System.Net.Http;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiCoachController : ControllerBase
{
    private readonly MoodLensDbContext _context;
    private readonly IGeminiAiService _aiService;

    public AiCoachController(
        MoodLensDbContext context,
        IGeminiAiService aiService)
    {
        _context = context;
        _aiService = aiService;
    }

    [HttpPost("ask")]
    public async Task<IActionResult> Ask(
        AskAiCoachRequest request)
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        // 1. Lấy journals làm context (tối đa 20 bài gần nhất)
        var journals =
            await _context.JournalEntries
            .Include(x => x.MoodAnalysis)
            .Where(x =>
                x.UserId ==
                Guid.Parse(userId))
            .OrderByDescending(x =>
                x.CreatedAt)
            .Take(20)
            .ToListAsync();

        var contextText =
            string.Join(
                "\n\n",
                journals.Select(x =>
                    $"""
                    Ngày: {x.CreatedAt:dd/MM/yyyy}
                    Mood: {x.MoodAnalysis?.Mood ?? "unknown"}
                    Score: {x.MoodAnalysis?.Score ?? 0}

                    Nhật ký:
                    {x.Content}
                    """
                ));

        // 2. Lấy lịch sử chat của conversation này (tối đa 3 lượt)
        var chatHistory = new List<(string Role, string Content)>();

        if (request.ConversationId != Guid.Empty)
        {
            var previousMessages =
                await _context.AiCoachMessages
                .Where(x =>
                    x.ConversationId == request.ConversationId)
                .OrderByDescending(x => x.CreatedAt).Take(3)  // lấy 3 mới nhất từ DB
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();

            chatHistory = previousMessages
                .Select(m => (m.Role, m.Content))
                .ToList();
        }

        // 3. Gọi AI với đủ context + history
        var answer =
            await _aiService.AI_Coach(
                contextText,
                request.Question,
                chatHistory);

        // 4. Lưu tin nhắn user
        _context.AiCoachMessages.Add(
            new AiCoachMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = request.ConversationId,
                Role = "user",
                Content = request.Question,
                CreatedAt = DateTime.UtcNow
            });

        // 5. Lưu tin nhắn AI
        _context.AiCoachMessages.Add(
            new AiCoachMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = request.ConversationId,
                Role = "assistant",
                Content = answer,
                CreatedAt = DateTime.UtcNow
            });

        await _context.SaveChangesAsync();

        return Ok(
            new AskAiCoachResponse
            {
                Answer = answer
            });
    }

    [HttpGet("coach-insight")]
    public async Task<IActionResult> CoachInsight()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        var journals =
            await _context.JournalEntries
            .Include(x => x.MoodAnalysis)
            .Where(x =>
                x.UserId ==
                Guid.Parse(userId))
            .ToListAsync();

        return Ok(new
        {
            total = journals.Count,

            happy =
                journals.Count(x =>
                    x.MoodAnalysis.Mood == "happy"),

            stress =
                journals.Count(x =>
                    x.MoodAnalysis.Mood == "stress"),

            sad =
                journals.Count(x =>
                    x.MoodAnalysis.Mood == "sad"),

            neutral =
                journals.Count(x =>
                    x.MoodAnalysis.Mood == "neutral"),

            average =
                journals.Any()
                    ? journals.Average(x =>
                        x.MoodAnalysis.Score)
                    : 0
        });
    }

    [HttpPost("conversation")]
    public async Task<IActionResult> CreateConversation()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        var conversation =
            new AiCoachConversation
            {
                Id = Guid.NewGuid(),
                UserId = Guid.Parse(userId),
                Title = "New Chat",
                CreatedAt = DateTime.UtcNow
            };

        _context.AiCoachConversations
            .Add(conversation);



        await _context.SaveChangesAsync();

        return Ok(new
        {
            conversation.Id
        });
    }
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        var list =
            await _context
            .AiCoachConversations
            .Where(x =>
                x.UserId == Guid.Parse(userId))
            .OrderByDescending(x => x.IsPinned)
            .ThenByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.CreatedAt,
                x.IsPinned
            })
            .ToListAsync();

        return Ok(list);
    }
    [HttpGet("conversation/{id}")]
    public async Task<IActionResult>
GetConversation(Guid id)
    {
        var data =
            await _context
            .AiCoachMessages
            .Where(x =>
                x.ConversationId == id)
            .OrderBy(x =>
                x.CreatedAt)
            .ToListAsync();

        return Ok(data);
    }

    [HttpDelete("conversation/delete/{id}")]
    public async Task<IActionResult> DeleteConversation(Guid id)
    {
        var conversation =
            await _context.AiCoachConversations
            .FirstOrDefaultAsync(x => x.Id == id);

        var messages =
await _context.AiCoachMessages
.Where(x =>
x.ConversationId == id)
.ToListAsync();


        if (conversation == null)
            return NotFound();

        if (messages == null)
            return NotFound();


        _context.AiCoachMessages.RemoveRange(
            messages);

        _context.AiCoachConversations.Remove(
    conversation
);

        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPut("conversation/rename/{id}")]
    public async Task<IActionResult> Rename(
    Guid id,
    RenameConversationRequest request)
    {
        var conversation =
            await _context.AiCoachConversations
            .FirstOrDefaultAsync(x => x.Id == id);

        if (conversation == null)
            return NotFound();

        conversation.Title =
            request.Title;

        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPut("conversation/pin/{id}")]
    public async Task<IActionResult> Pin(
    Guid id)
    {
        var conversation =
            await _context.AiCoachConversations
            .FirstOrDefaultAsync(x => x.Id == id);

        if (conversation == null)
            return NotFound();

        conversation.IsPinned =
            !conversation.IsPinned;

        await _context.SaveChangesAsync();

        return Ok();
    }
    public class RenameConversationRequest
    {
        public string Title { get; set; } = "";
    }
}