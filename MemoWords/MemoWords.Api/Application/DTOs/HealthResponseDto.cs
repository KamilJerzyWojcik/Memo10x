namespace MemoWords.Api.Application.DTOs
{
	public sealed record class HealthResponseDto
	{
		public string Status { get; init; } = "ok";
		public DateTimeOffset Time { get; init; }
	}
}