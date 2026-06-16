using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoodLens.Domain.Entities;

public class MoodSnapshotConfiguration
    : IEntityTypeConfiguration<MoodSnapshot>
{
    public void Configure(EntityTypeBuilder<MoodSnapshot> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ImageUrl)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Mood)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Caption)
            .HasMaxLength(300);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId);
    }
}