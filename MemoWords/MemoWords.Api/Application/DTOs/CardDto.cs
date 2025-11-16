using System;

namespace MemoWords.Api.Application.DTOs
{
	/// <summary>
	/// Reprezentacja do odczytu karty słownictwa w API.
	/// Projekcja encji <see cref="Domain.Entities.Card"/> ograniczona do pól wymaganych przez kontrakt API.
	/// </summary>
	public sealed record class CardDto
	{
		/// <summary>
		/// Unikalny identyfikator karty (projekcja z <see cref="Domain.Entities.Card.Id"/>).
		/// </summary>
		public Guid Id { get; init; }

		/// <summary>
		/// Tekst źródłowy EN (projekcja z <see cref="Domain.Entities.Card.SourceText"/>).
		/// </summary>
		public string SourceText { get; init; } = string.Empty;

		/// <summary>
		/// Tekst docelowy PL (projekcja z <see cref="Domain.Entities.Card.TargetText"/>).
		/// </summary>
		public string TargetText { get; init; } = string.Empty;

		/// <summary>
		/// Czas utworzenia w UTC (projekcja z <see cref="Domain.Entities.Card.CreatedAt"/>).
		/// </summary>
		public DateTimeOffset CreatedAt { get; init; }

		/// <summary>
		/// Czas ostatniej modyfikacji w UTC (projekcja z <see cref="Domain.Entities.Card.UpdatedAt"/>).
		/// </summary>
		public DateTimeOffset UpdatedAt { get; init; }
	}
}


