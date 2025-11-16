namespace MemoWords.Api.Application.DTOs
{
	public sealed record class HealthResponseDto
	{
		public string Status { get; init; } = "ok";
		public string Version { get; init; } = string.Empty;
		public DateTimeOffset Time { get; init; }
	}
}