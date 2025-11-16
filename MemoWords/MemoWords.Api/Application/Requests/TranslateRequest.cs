using System.ComponentModel.DataAnnotations;

namespace MemoWords.Api.Application.Requests
{
	public sealed class TranslateRequest
	{
		[Required]
		[StringLength(500, MinimumLength = 1)]
		public required string SourceText { get; init; }

	}
}