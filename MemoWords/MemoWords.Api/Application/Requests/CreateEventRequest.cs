using System.ComponentModel.DataAnnotations;
using MemoWords.Api.Domain.Entities;

namespace MemoWords.Api.Application.Requests
{
	public sealed class CreateEventRequest
	{
		public required EventType Type { get; init; }

		public Guid? CardId { get; init; }

		[StringLength(100)]
		public string? ErrorCode { get; init; }
	}
}