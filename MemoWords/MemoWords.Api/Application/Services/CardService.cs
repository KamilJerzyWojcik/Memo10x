using MemoWords.Api.Application.DTOs;
using MemoWords.Api.Domain.Entities;
using MemoWords.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MemoWords.Api.Application.Services
{
    public sealed class CardService : ICardService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<CardService> _logger;

        public CardService(ApplicationDbContext dbContext, ILogger<CardService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<Card?> GetCardByIdAsync(Guid userId, Guid id, CancellationToken cancellationToken)
        {
            var card = await _dbContext.Cards
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId, cancellationToken);

            if (card is null)
            {
                _logger.LogWarning("Card {CardId} not found for user {UserId}", id, userId);
                return null;
            }

            _logger.LogInformation("Fetched card {CardId} for user {UserId}", id, userId);
            return card;
        }

        public async Task<Card> CreateCardAsync(Guid userId, string sourceText, string targetText, CancellationToken cancellationToken)
        {
			var entity = Card.CreateEntity(userId, sourceText, targetText);

            await _dbContext.Cards.AddAsync(entity, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Card {CardId} created for user {UserId}", entity.Id, userId);

            return entity;
        }

        public async Task<PagedResultDto<CardDto>> GetCardsAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
        {
            var query = _dbContext.Cards
                .AsNoTracking()
                .Where(c => c.UserId == userId);

            var total = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(c => c.CreatedAt)
                .ThenByDescending(c => c.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => c.CreateCardDto())
                .ToListAsync(cancellationToken);

            var hasNextPage = page * pageSize < total;

            return PagedResultDto<CardDto>.Create(items, page, pageSize, total, hasNextPage);

        }

			public async Task<Card?> UpdateCardAsync(Guid userId, Guid id, string? sourceText, string? targetText, CancellationToken cancellationToken)
			{
				var card = await _dbContext.Cards
					.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId, cancellationToken);

				if (card is null)
				{
					_logger.LogWarning("Card {CardId} not found for user {UserId} when updating", id, userId);
					return null;
				}

				var anyChanged = card.UpdateTexts(sourceText, targetText);

				if (anyChanged)
				{
					await _dbContext.SaveChangesAsync(cancellationToken);
					_logger.LogInformation("Card {CardId} updated for user {UserId}", id, userId);
				}
				else
				{
					_logger.LogInformation("Card {CardId} for user {UserId} received PATCH with no effective changes", id, userId);
				}

				return card;
			}
    }
}


