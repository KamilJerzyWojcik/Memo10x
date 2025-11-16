using System.Text.Json;

namespace MemoWords.Api.Domain.Entities
{
	public class Event
	{
		public Guid Id { get; set; }

		public Guid? UserId { get; set; }

		public EventType Type { get; set; }

		public DateTimeOffset CreatedAt { get; set; }

		public Guid? CardId { get; set; }
		public Card? Card { get; set; }

		public JsonDocument? Meta { get; set; }
		public string? ErrorCode { get; set; }
		public string? AiModel { get; set; }
	}
}


