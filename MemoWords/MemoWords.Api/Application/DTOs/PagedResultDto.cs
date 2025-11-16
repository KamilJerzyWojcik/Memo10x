using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MemoWords.Api.Application.DTOs
{
	public sealed record class PagedResultDto<TItem>
	{
		public IReadOnlyList<TItem> Items { get; init; } = Array.Empty<TItem>();

		public int Page { get; init; }

		public int PageSize { get; init; }

		public int Total { get; init; }

		public bool HasNextPage { get; init; }

		public static PagedResultDto<TItem> Create(List<TItem> items, int page, int pageSize, int total, bool hasNextPage)
		{
			return new PagedResultDto<TItem>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                Total = total,
                HasNextPage = hasNextPage
            };
        }
    }
}


