using System.ComponentModel.DataAnnotations;

namespace MemoWords.Api.Application.Requests
{
	public sealed class GetCardsQuery
	{
		[Range(1, int.MaxValue)]
		public int Page { get; init; } = 1;

		[Range(1, int.MaxValue)]
		public int PageSize { get; init; } = 10;
	}
}