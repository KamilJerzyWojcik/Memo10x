using MemoWords.Api.Application.DTOs;
using MemoWords.Api.Domain.Entities;

namespace MemoWords.Api.Application.Mappers
{
	public static class CardMapper
	{
		public static CardDto ToDto(Card card)
		{
			return new CardDto
			{
                Id = card.Id,
                SourceText = card.SourceText,
                TargetText = card.TargetText,
                CreatedAt = card.CreatedAt,
                UpdatedAt = card.UpdatedAt
            };
		}
	}
}


