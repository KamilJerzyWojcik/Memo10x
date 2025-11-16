namespace MemoWords.Api.Application.DTOs
{
	public sealed record class CardDto
	{
		public Guid Id { get; init; }

		public string SourceText { get; init; } = string.Empty;

		public string TargetText { get; init; } = string.Empty;

		public DateTimeOffset CreatedAt { get; init; }

		public DateTimeOffset UpdatedAt { get; init; }
	}
}


