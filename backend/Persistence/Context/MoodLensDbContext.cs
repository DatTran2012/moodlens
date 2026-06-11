using Microsoft.EntityFrameworkCore;
using MoodLens.Domain.Entities;

namespace MoodLens.Persistence.Context;

public class MoodLensDbContext : DbContext
{
    public MoodLensDbContext(
        DbContextOptions<MoodLensDbContext> options)
        : base(options)
    { }

    public DbSet<User> Users => Set<User>();

    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();

    public DbSet<MoodAnalysis> MoodAnalyses => Set<MoodAnalysis>();

    public DbSet<WeeklyInsight> WeeklyInsights => Set<WeeklyInsight>();
    public DbSet<AiCoachConversation>
    AiCoachConversations
    {
        get;
        set;
    }

    public DbSet<AiCoachMessage>
        AiCoachMessages
    {
        get;
        set;
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // -------------------------------------------------------------
        // 1. Cấu hình mối quan hệ giữa Users và JournalEntries (1 - Nhiều)
        // -------------------------------------------------------------
        modelBuilder.Entity<JournalEntry>()
            .HasOne(j => j.User)                  // JournalEntry có 1 User
            .WithMany(u => u.JournalEntries)      // User có nhiều JournalEntries
            .HasForeignKey(j => j.UserId)         // Khóa ngoại là UserId
            .OnDelete(DeleteBehavior.Cascade);    // Xóa User thì xóa luôn Journal tương ứng

        // -------------------------------------------------------------
        // 2. Cấu hình mối quan hệ giữa JournalEntries và MoodAnalyses (1 - 1)
        // -------------------------------------------------------------
        modelBuilder.Entity<MoodAnalysis>()
            .HasOne(m => m.JournalEntry)          // MoodAnalysis có 1 JournalEntry
            .WithOne(j => j.MoodAnalysis)         // JournalEntry có 1 MoodAnalysis
            .HasForeignKey<MoodAnalysis>(m => m.JournalEntryId) // Chỉ định MoodAnalysis giữ khóa ngoại
            .OnDelete(DeleteBehavior.Cascade);    // Xóa bài nhật ký thì xóa luôn phân tích tâm trạng
    }
}
