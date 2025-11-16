using FluentValidation;
using MemoWords.Api.Application.Requests;

namespace MemoWords.Api.Application.Validation
{
	public sealed class CreateCardRequestValidator : AbstractValidator<CreateCardRequest>
	{
		public CreateCardRequestValidator()
		{
			RuleFor(x => x.SourceText)
				.Cascade(CascadeMode.Stop)
				.Must(s => !string.IsNullOrWhiteSpace(s?.Trim()))
				.WithMessage("'sourceText' must not be empty or whitespace.")
				.Must(s => (s ?? string.Empty).Trim().Length <= 500)
				.WithMessage("'sourceText' must be at most 500 characters.");

			RuleFor(x => x.TargetText)
				.Cascade(CascadeMode.Stop)
				.Must(s => !string.IsNullOrWhiteSpace(s?.Trim()))
				.WithMessage("'targetText' must not be empty or whitespace.")
				.Must(s => (s ?? string.Empty).Trim().Length <= 500)
				.WithMessage("'targetText' must be at most 500 characters.");
		}
	}
}


