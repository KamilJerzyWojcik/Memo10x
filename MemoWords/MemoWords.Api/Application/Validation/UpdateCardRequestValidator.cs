using FluentValidation;
using MemoWords.Api.Application.DTOs;

namespace MemoWords.Api.Application.Validation
{
	public sealed class UpdateCardRequestValidator : AbstractValidator<UpdateCardRequestDto>
	{
		public UpdateCardRequestValidator()
		{
			RuleFor(x => x)
				.Must(x => x.SourceText is not null || x.TargetText is not null)
				.WithMessage("At least one of 'sourceText' or 'targetText' must be provided.");

			When(x => x.SourceText is not null, () =>
			{
				RuleFor(x => x.SourceText)
					.Cascade(CascadeMode.Stop)
					.Must(s => !string.IsNullOrWhiteSpace(s?.Trim()))
					.WithMessage("'sourceText' must not be empty or whitespace.")
					.Must(s => (s ?? string.Empty).Trim().Length <= 500)
					.WithMessage("'sourceText' must be at most 500 characters.");
			});

			When(x => x.TargetText is not null, () =>
			{
				RuleFor(x => x.TargetText)
					.Cascade(CascadeMode.Stop)
					.Must(s => !string.IsNullOrWhiteSpace(s?.Trim()))
					.WithMessage("'targetText' must not be empty or whitespace.")
					.Must(s => (s ?? string.Empty).Trim().Length <= 500)
					.WithMessage("'targetText' must be at most 500 characters.");
			});
		}
	}
}



