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

		public static Card CreateEntity(Guid userId, string sourceText, string targetText)
		{
			var trimmedSource = (sourceText ?? string.Empty).Trim();
			var trimmedTarget = (targetText ?? string.Empty).Trim();
			return new Card
			{
				UserId = userId,
				SourceText = trimmedSource,
				TargetText = trimmedTarget
			};
		}

		public bool UpdateTexts(string? sourceText, string? targetText)
		{
			var anyChanged = false;

			if (sourceText is not null)
			{
				var trimmedSource = sourceText.Trim();
				if (!string.Equals(SourceText, trimmedSource, StringComparison.Ordinal))
				{
					SourceText = trimmedSource;
					anyChanged = true;
				}
			}

			if (targetText is not null)
			{
				var trimmedTarget = targetText.Trim();
				if (!string.Equals(TargetText, trimmedTarget, StringComparison.Ordinal))
				{
					TargetText = trimmedTarget;
					anyChanged = true;
				}
			}

			return anyChanged;
		}
	}
}


