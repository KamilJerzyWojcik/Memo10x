using MemoWords.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MemoWords.Api.Infrastructure.Persistence.Configurations
{
	public class CardConfiguration : IEntityTypeConfiguration<Card>
	{
		public void Configure(EntityTypeBuilder<Card> builder)
		{
			builder.ToTable("cards", schema: "public", t =>
			{
				t.HasCheckConstraint("ck_cards_source_text_not_blank", "btrim(source_text) <> ''");
				t.HasCheckConstraint("ck_cards_target_text_not_blank", "btrim(target_text) <> ''");
				t.HasCheckConstraint("ck_cards_source_text_len", "char_length(btrim(source_text)) BETWEEN 1 AND 500");
				t.HasCheckConstraint("ck_cards_target_text_len", "char_length(btrim(target_text)) BETWEEN 1 AND 500");
			});

			builder.HasKey(x => x.Id);

			builder.Property(x => x.Id)
				.HasColumnName("id")
				.HasDefaultValueSql("gen_random_uuid()");

			builder.Property(x => x.UserId)
				.IsRequired();

			builder.Property(x => x.SourceText)
				.IsRequired()
				.HasColumnType("text");

			builder.Property(x => x.TargetText)
				.IsRequired()
				.HasColumnType("text");

			builder.Property(x => x.CreatedAt)
				.HasColumnType("timestamp with time zone")
				.HasDefaultValueSql("now()")
				.IsRequired();

			builder.Property(x => x.UpdatedAt)
				.HasColumnType("timestamp with time zone")
				.HasDefaultValueSql("now()")
				.IsRequired();

			builder.HasIndex(x => new { x.UserId, x.CreatedAt, x.Id })
				.HasDatabaseName("idx_cards_user_created_id")
				.IsDescending(false, true, true);

			builder.HasMany(x => x.Events)
				.WithOne(e => e.Card)
				.HasForeignKey(e => e.CardId)
				.OnDelete(DeleteBehavior.SetNull);

			// Uwaga: FK do auth.users (cards.user_id) dodajemy w migracji jako surowe SQL.
		}
	}
}


