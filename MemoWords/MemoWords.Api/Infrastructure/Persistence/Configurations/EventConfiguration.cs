using MemoWords.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MemoWords.Api.Infrastructure.Persistence.Configurations
{
	public class EventConfiguration : IEntityTypeConfiguration<Event>
	{
		public void Configure(EntityTypeBuilder<Event> builder)
		{
			builder.ToTable("events", schema: "public");

			builder.HasKey(x => x.Id);

			builder.Property(x => x.Id)
				.HasDefaultValueSql("gen_random_uuid()");

			builder.Property(x => x.UserId)
				.IsRequired(false);

			builder.Property(x => x.Type)
				.IsRequired()
				.HasColumnType("public.event_type");

			builder.Property(x => x.CreatedAt)
				.HasColumnType("timestamp with time zone")
				.HasDefaultValueSql("now()")
				.IsRequired();

			builder.Property(x => x.CardId)
				.IsRequired(false);

			builder.Property(x => x.Meta)
				.HasColumnType("jsonb")
				.IsRequired(false);

			builder.Property(x => x.ErrorCode)
				.HasColumnType("text")
				.IsRequired(false);

			builder.Property(x => x.AiModel)
				.HasColumnType("text")
				.IsRequired(false);

			builder.HasIndex(x => new { x.UserId, x.CreatedAt })
				.HasDatabaseName("idx_events_user_created")
				.IsDescending(false, true);

			builder.HasIndex(x => new { x.Type, x.CreatedAt })
				.HasDatabaseName("idx_events_type_created")
				.IsDescending(false, true);

			builder.HasIndex(x => new { x.CardId, x.CreatedAt })
				.HasDatabaseName("idx_events_card_created")
				.IsDescending(false, true);

			builder.HasOne(x => x.Card)
				.WithMany(c => c.Events)
				.HasForeignKey(x => x.CardId)
				.OnDelete(DeleteBehavior.SetNull);

			// Uwaga: FK do auth.users (events.user_id) dodajemy w migracji jako surowe SQL.
		}
	}
}


