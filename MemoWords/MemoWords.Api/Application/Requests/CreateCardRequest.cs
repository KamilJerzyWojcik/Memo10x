using System.ComponentModel.DataAnnotations;

namespace MemoWords.Api.Application.Requests
{
	public sealed class CreateCardRequest
	{
		[StringLength(500, MinimumLength = 1)]
		public required string SourceText { get; init; }

		[StringLength(500, MinimumLength = 1)]
		public required string TargetText { get; init; }
	}
}