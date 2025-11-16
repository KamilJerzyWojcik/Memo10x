using MemoWords.Api.Application.DTOs;

namespace MemoWords.Api.Domain.Entities
{
	public class Card
	{
		public Guid Id { get; set; }
		public Guid UserId { get; set; }

		public string SourceText { get; set; } = string.Empty;
		public string TargetText { get; set; } = string.Empty;

		public DateTimeOffset CreatedAt { get; set; }
		public DateTimeOffset UpdatedAt { get; set; }

		public ICollection<Event> Events { get; set; } = new List<Event>();

		public CardDto CreateCardDto()
		{
			return new CardDto
			{
				Id = Id,
				SourceText = SourceText,
				TargetText = TargetText,
				CreatedAt = CreatedAt,
				UpdatedAt = UpdatedAt
			};

        }

		public static Card CreateEtity(Guid userId, string trimmedSource, string trimmedTarget)
		{
            return new Card
            {
                UserId = userId,
                SourceText = trimmedSource,
                TargetText = trimmedTarget
            };
        }
	}
}


