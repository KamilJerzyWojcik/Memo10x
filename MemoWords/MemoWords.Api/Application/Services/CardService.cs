using MemoWords.Api.Domain.Entities;
using MemoWords.Api.Infrastructure.Persistence;

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

			var entity = new Card
			{
				UserId = userId,
				SourceText = trimmedSource,
				TargetText = trimmedTarget
			};

			await _dbContext.Cards.AddAsync(entity, cancellationToken);
			await _dbContext.SaveChangesAsync(cancellationToken);

			_logger.LogInformation("Card {CardId} created for user {UserId}", entity.Id, userId);

			return entity;
		}
	}
}


