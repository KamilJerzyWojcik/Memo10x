using System;
using System.Collections.Generic;

namespace MemoWords.Api.Domain.Entities
{
	public class Card
	{
		public Guid Id { get; set; }
		public Guid UserId { get; set; }

		public string SourceText { get; set; } = string.Empty;
		public string TargetText { get; set; } = string.Empty;

		public DateTimeOffset CreatedAt { get; set; }
		public DateTimeOffset UpdatedAt { get; set; }

		public ICollection<Event> Events { get; set; } = new List<Event>();
	}
}


