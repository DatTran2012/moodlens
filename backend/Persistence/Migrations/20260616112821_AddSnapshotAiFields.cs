using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Moodlens.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSnapshotAiFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AiAnalyzedAt",
                table: "MoodSnapshots",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiEmotion",
                table: "MoodSnapshots",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiInsight",
                table: "MoodSnapshots",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AiScore",
                table: "MoodSnapshots",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiAnalyzedAt",
                table: "MoodSnapshots");

            migrationBuilder.DropColumn(
                name: "AiEmotion",
                table: "MoodSnapshots");

            migrationBuilder.DropColumn(
                name: "AiInsight",
                table: "MoodSnapshots");

            migrationBuilder.DropColumn(
                name: "AiScore",
                table: "MoodSnapshots");
        }
    }
}
