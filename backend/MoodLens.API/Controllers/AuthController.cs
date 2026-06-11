using Microsoft.AspNetCore.Mvc;
using MoodLens.Application.DTOs.Auth;
using MoodLens.Application.Interfaces;

namespace MoodLens.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        await _authService.Register(request);
        return Ok("Register success");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.Login(request);
        return Ok(result);
    }
}