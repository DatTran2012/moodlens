using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/mood-snapshots")]
[Authorize]
public class MoodSnapshotController
    : ControllerBase
{
    private readonly IMoodSnapshotService _service;

    public MoodSnapshotController(
        IMoodSnapshotService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        IFormFile file,
        [FromForm] string mood,
        [FromForm] string caption)
    {
        try
        {
            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var result =
                await _service.CreateAsync(
                    Guid.Parse(userId),
                    file,
                    new CreateMoodSnapshotRequest
                    {
                        Mood = mood,
                        Caption = caption
                    });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet]
    public async Task<IActionResult> Timeline()
    {
        var userId =
           User.FindFirstValue(
               ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        return Ok(
            await _service.GetTimelineAsync(
                Guid.Parse(userId)));
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
    Guid id)
    {
        var userId =
                 User.FindFirstValue(
                     ClaimTypes.NameIdentifier);

        if (userId == null)
            return Unauthorized();

        await _service.DeleteAsync(
                 Guid.Parse(userId),
            id);

        return NoContent();
    }
}