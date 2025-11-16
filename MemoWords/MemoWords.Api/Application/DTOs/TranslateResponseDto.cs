namespace MemoWords.Api.Application.DTOs
{
	public sealed record class TranslateResponseDto
	{
		public string Translation { get; init; } = string.Empty;
	}
}