namespace MemoWords.Api.Application.DTOs
{
	public sealed class UpdateCardRequestDto
	{
		public string? SourceText { get; init; }

		public string? TargetText { get; init; }
	}
}



