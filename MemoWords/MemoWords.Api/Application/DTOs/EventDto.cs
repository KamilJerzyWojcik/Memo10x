using MemoWords.Api.Domain.Entities;

namespace MemoWords.Api.Application.DTOs
{
	public sealed record class EventDto
	{
		public Guid Id { get; init; }
		public Guid? UserId { get; init; }

		public EventType Type { get; init; }

		public DateTimeOffset CreatedAt { get; init; }

		public Guid? CardId { get; init; }

		public string? ErrorCode { get; init; }
	}
}


