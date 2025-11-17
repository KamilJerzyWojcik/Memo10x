using FluentValidation;
using MemoWords.Api.Application.Requests;

namespace MemoWords.Api.Application.Validation
{
	public sealed class TranslateRequestValidator : AbstractValidator<TranslateRequest>
	{
		public TranslateRequestValidator()
		{
			// Walidacja: trim + niepusty + długość 1..500 po trim
			RuleFor(x => x.SourceText)
				.Cascade(CascadeMode.Stop)
				.NotNull()
				.WithMessage("sourceText is required")
				.Must(s => !string.IsNullOrWhiteSpace(s))
				.WithMessage("sourceText must not be empty after trimming")
				.Must(s => (s?.Trim().Length ?? 0) <= 500)
				.WithMessage("sourceText must be at most 500 characters after trimming");
		}
	}
}


