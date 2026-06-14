using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MoodLens.Application.Interfaces;
using MoodLens.Infrastructure.Services;
using MoodLens.Persistence.Context;
using System.Diagnostics;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

#region "JWT"
var jwtKey = builder.Configuration["Jwt:Key"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey!)
        )
    };
});

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});
#endregion

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://192.168.1.50:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowFrontend", policy =>
//    {
//        policy
//            .WithOrigins(
//                "https://moodlens-mauve.vercel.app/"
//            )
//            .AllowAnyHeader()
//            .AllowAnyMethod()
//            .AllowCredentials();
//    });
//});
//Authen    
builder.Services.AddScoped<IAuthService, AuthService>();

//Service Mood
builder.Services.AddScoped<AiMoodService>();
//Service Dashboard
builder.Services.AddScoped<DashboardService>();
//Service Weekly Insight
builder.Services.AddScoped<IWeeklyInsightService, WeeklyInsightService>();
// Ollama AI
builder.Services.AddHttpClient<IOllamaAiService, OllamaAiService>();
// Gemini AI
builder.Services.AddHttpClient();
builder.Services.AddScoped<GeminiAiService>();
// Groq AI
builder.Services.AddHttpClient();
builder.Services.AddScoped<GroqAiService>();
// WeeklyInsightWorker
builder.Services.AddHostedService<WeeklyInsightWorker>();
////Database configuration sql server
//builder.Services.AddDbContext<MoodLensDbContext>(options =>
//{
//    options.UseSqlServer(
//        builder.Configuration.GetConnectionString("DefaultConnection"));
//});

////Database configuration postgresql
builder.Services.AddDbContext<MoodLensDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration
            .GetConnectionString("DefaultConnection1"));
});

var app = builder.Build();
//Start Ollama if not running
//var ollamaProcess = Process.GetProcessesByName("ollama");

//if (!ollamaProcess.Any())
//{
//    Console.WriteLine("🚀 Starting Ollama...");

//    Process.Start(new ProcessStartInfo
//    {
//        FileName = "ollama",
//        Arguments = "serve",
//        UseShellExecute = true,
//        CreateNoWindow = true
//    });

//    await Task.Delay(5000);
//}

// =========================
// AUTO START OLLAMA
// =========================

using (var http = new HttpClient())
{
    try
    {
        var response = await http.GetAsync(
            "http://localhost:11434/api/tags");

        if (!response.IsSuccessStatusCode)
            throw new Exception();
    }
    catch
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("⚠️ Ollama chưa chạy. Đang khởi động...");
        Console.ResetColor();

        Process.Start(new ProcessStartInfo
        {
            FileName = "ollama",
            Arguments = "serve",
            UseShellExecute = true,
            CreateNoWindow = true,
            WindowStyle = ProcessWindowStyle.Hidden
        });

        // chờ Ollama mở port
        await Task.Delay(5000);
    }
}

Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("✅ Ollama Ready");
Console.ResetColor();


// =========================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowReact");
//JWT
app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();
app.MapControllers();

app.Run();