using FluentValidation;
using MemoWords.Api.Application.Requests;

namespace MemoWords.Api.Application.Validation
{
	public sealed class GetCardsQueryValidator : AbstractValidator<GetCardsQuery>
	{
		public GetCardsQueryValidator()
		{
			RuleFor(x => x.Page)
				.Cascade(CascadeMode.Stop)
				.GreaterThanOrEqualTo(1)
				.WithMessage("'page' must be greater than or equal to 1.");

			RuleFor(x => x.PageSize)
				.Cascade(CascadeMode.Stop)
				.Must(ps => ps == 10 || ps == 50 || ps == 100)
				.WithMessage("'pageSize' must be one of: 10, 50, 100.");
		}
	}
}

