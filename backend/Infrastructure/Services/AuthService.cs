using Microsoft.EntityFrameworkCore;
using MoodLens.Application.DTOs.Auth;
using MoodLens.Application.Interfaces;
using MoodLens.Domain.Entities;
using MoodLens.Persistence.Context;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace MoodLens.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly MoodLensDbContext _context;

    public AuthService(MoodLensDbContext context)
    {
        _context = context;
    }

    public async Task Register(RegisterRequest request)
    {
        var userExists = await _context.Users
            .AnyAsync(x => x.Email == request.Email);

        if (userExists)
            throw new Exception("Email already exists");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    public async Task<AuthResponse> Login(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user == null)
            throw new Exception("User not found");

        if (user.PasswordHash != HashPassword(request.Password))
            throw new Exception("Invalid password");

        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            Token = token
        };
    }

    private string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.FullName)
    };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("THIS_IS_SUPER_SECRET_KEY_123456789")
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "MoodLens",
            audience: "MoodLensUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}