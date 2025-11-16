using MemoWords.Api.Domain.Entities;

namespace MemoWords.Api.Application.Services
{
	public interface ICardService
	{
		Task<Card> CreateCardAsync(Guid userId, string sourceText, string targetText, CancellationToken cancellationToken);
	}
}


