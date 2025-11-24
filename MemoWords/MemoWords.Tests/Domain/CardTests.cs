using System;
using FluentAssertions;
using MemoWords.Api.Domain.Entities;

namespace MemoWords.Tests.Domain
{
	public class CardTests
	{
		#region CreateEntity
		[Theory]
		[InlineData(" hello ", " world ", "hello", "world")]
		[InlineData("\tHi\t", "  Cześć  ", "Hi", "Cześć")]
		public void CreateEntity_InputHasSpaces_TrimsAndSetsUserId(string sourceIn, string targetIn, string expectedSource, string expectedTarget)
		{
			// Arrange
			var userId = Guid.NewGuid();

			// Act
			var card = Card.CreateEntity(userId, sourceIn, targetIn);

			// Assert
			card.UserId.Should().Be(userId);
			card.SourceText.Should().Be(expectedSource);
			card.TargetText.Should().Be(expectedTarget);
		}

		[Fact]
		public void CreateEntity_WhitespaceOnly_ResultsInEmptyTexts()
		{
			// Arrange
			var userId = Guid.NewGuid();

			// Act
			var card = Card.CreateEntity(userId, "   ", "\t  ");

			// Assert
			card.SourceText.Should().BeEmpty();
			card.TargetText.Should().BeEmpty();
		}
		#endregion

		#region UpdateTexts
		[Fact]
		public void UpdateTexts_BothNull_NoChange_ReturnsFalse()
		{
			// Arrange
			var card = new Card { SourceText = "hello", TargetText = "cześć" };

			// Act
			var changed = card.UpdateTexts(null, null);

			// Assert
			changed.Should().BeFalse();
			card.SourceText.Should().Be("hello");
			card.TargetText.Should().Be("cześć");
		}

		[Fact]
		public void UpdateTexts_SourceWhitespaceEqualsCurrent_NoChange_ReturnsFalse()
		{
			// Arrange
			var card = new Card { SourceText = "hello", TargetText = "cześć" };

			// Act
			var changed = card.UpdateTexts("  hello  ", null);

			// Assert
			changed.Should().BeFalse();
			card.SourceText.Should().Be("hello");
			card.TargetText.Should().Be("cześć");
		}

		[Fact]
		public void UpdateTexts_TargetWhitespaceEqualsCurrent_NoChange_ReturnsFalse()
		{
			// Arrange
			var card = new Card { SourceText = "hello", TargetText = "cześć" };

			// Act
			var changed = card.UpdateTexts(null, "   cześć\t");

			// Assert
			changed.Should().BeFalse();
			card.SourceText.Should().Be("hello");
			card.TargetText.Should().Be("cześć");
		}

		[Fact]
		public void UpdateTexts_SourceChanged_UpdatesAndReturnsTrue()
		{
			// Arrange
			var card = new Card { SourceText = "hello", TargetText = "cześć" };

			// Act
			var changed = card.UpdateTexts("hi", null);

			// Assert
			changed.Should().BeTrue();
			card.SourceText.Should().Be("hi");
			card.TargetText.Should().Be("cześć");
		}

		[Fact]
		public void UpdateTexts_TargetChanged_UpdatesAndReturnsTrue()
		{
			// Arrange
			var card = new Card { SourceText = "hello", TargetText = "cześć" };

			// Act
			var changed = card.UpdateTexts(null, "siema");

			// Assert
			changed.Should().BeTrue();
			card.SourceText.Should().Be("hello");
			card.TargetText.Should().Be("siema");
		}

		[Fact]
		public void UpdateTexts_BothChanged_UpdatesBothAndReturnsTrue()
		{
			// Arrange
			var card = new Card { SourceText = "hello", TargetText = "cześć" };

			// Act
			var changed = card.UpdateTexts("hi", "siema");

			// Assert
			changed.Should().BeTrue();
			card.SourceText.Should().Be("hi");
			card.TargetText.Should().Be("siema");
		}

		[Fact]
		public void UpdateTexts_CaseOnlyDifference_IsConsideredChange()
		{
			// Arrange
			var card = new Card { SourceText = "Hello", TargetText = "CZEŚĆ" };

			// Act
			var changed = card.UpdateTexts("hello", "cześć");

			// Assert
			changed.Should().BeTrue("Ordinal comparison treats case-only difference as change");
			card.SourceText.Should().Be("hello");
			card.TargetText.Should().Be("cześć");
		}
		#endregion

		#region CreateCardDto
		[Fact]
		public void CreateCardDto_MapsAllFields()
		{
			// Arrange
			var id = Guid.NewGuid();
			var created = new DateTimeOffset(2024, 01, 02, 03, 04, 05, TimeSpan.Zero);
			var updated = new DateTimeOffset(2024, 02, 03, 04, 05, 06, TimeSpan.Zero);

			var card = new Card
			{
				Id = id,
				UserId = Guid.NewGuid(),
				SourceText = "hello",
				TargetText = "cześć",
				CreatedAt = created,
				UpdatedAt = updated
			};

			// Act
			var dto = card.CreateCardDto();

			// Assert
			dto.Id.Should().Be(id);
			dto.SourceText.Should().Be("hello");
			dto.TargetText.Should().Be("cześć");
			dto.CreatedAt.Should().Be(created);
			dto.UpdatedAt.Should().Be(updated);
		}
		#endregion
	}
}




