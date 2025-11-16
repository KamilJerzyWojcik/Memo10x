using System.Reflection;
using MemoWords.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MemoWords.Api.Infrastructure.Persistence
{
	public class ApplicationDbContext : DbContext
	{
		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
		{
		}

		public DbSet<Card> Cards => Set<Card>();
		public DbSet<Event> Events => Set<Event>();

		public override int SaveChanges(bool acceptAllChangesOnSuccess)
		{
			UpdateTimestamps();
			return base.SaveChanges(acceptAllChangesOnSuccess);
		}

		public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
		{
			UpdateTimestamps();
			return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
		}

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			// Rejestracja enumu PostgreSQL dla kolumny events.type
			// Używamy enumu w schemacie public o nazwie "event_type"
			modelBuilder.HasPostgresEnum<EventType>("public", "event_type");

			// Zastosowanie wszystkich konfiguracji z bieżącego assembly
			modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

			// Decyzje projektowe:
			// - Nazewnictwo w snake_case ustawiamy w konfiguracji opcji (UseSnakeCaseNamingConvention)
			// - Polityki RLS oraz FK do auth.users tworzone są w migracji z użyciem SQL (nie modelowane encjami)
			base.OnModelCreating(modelBuilder);
		}

		private void UpdateTimestamps()
		{
			var utcNow = DateTimeOffset.UtcNow;

			foreach (var entry in ChangeTracker.Entries<Card>())
			{
				if (entry.State == EntityState.Modified)
				{
					entry.Entity.UpdatedAt = utcNow;
				}
			}
		}
	}
}


