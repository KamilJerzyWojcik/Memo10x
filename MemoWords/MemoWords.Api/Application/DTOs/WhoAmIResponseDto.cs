namespace MemoWords.Api.Application.DTOs
{
	public sealed record class WhoAmIResponseDto
	{
		public Guid UserId { get; init; }

		public string Email { get; init; } = string.Empty;

		public DateTimeOffset IssuedAt { get; init; }

		public DateTimeOffset ExpiresAt { get; init; }
	}
}