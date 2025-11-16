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

		public async Task<Card> CreateCardAsync(Guid userId, string sourceText, string targetText, CancellationToken cancellationToken)
		{
			var trimmedSource = (sourceText ?? string.Empty).Trim();
			var trimmedTarget = (targetText ?? string.Empty).Trim();

			var entity = Card.CreateEtity(userId, trimmedSource, trimmedTarget);

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
	}
}


