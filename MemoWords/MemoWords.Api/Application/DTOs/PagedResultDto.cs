namespace MemoWords.Api.Application.DTOs
{
	public sealed record class PagedResultDto<TItem>
	{
		public int Page { get; init; }

		public int PageSize { get; init; }

		public int Total { get; init; }

		public bool HasNextPage { get; init; }
	}
}


