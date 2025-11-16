using MemoWords.Api.Application.DTOs;
using MemoWords.Api.Domain.Entities;

namespace MemoWords.Api.Application.Services
{
    public interface ICardService
    {
        Task<Card> CreateCardAsync(Guid userId, string sourceText, string targetText, CancellationToken cancellationToken);

        Task<Card?> GetCardByIdAsync(Guid userId, Guid id, CancellationToken cancellationToken);

        Task<PagedResultDto<CardDto>> GetCardsAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken);
    }
}


