using MemoWords.Api.Application.Services.Exceptions;

namespace MemoWords.Api.Application.Services
{
	public sealed class MockAiTranslationService : IAiTranslationService
	{
		public Task<AiTranslationResult> TranslateAsync(string sourceText, CancellationToken cancellationToken)
		{
			if (string.IsNullOrWhiteSpace(sourceText))
			{
				throw new AiServiceException("Source text cannot be empty", "invalid_input");
			}

			var translation = $"Example translation";

			var result = new AiTranslationResult(translation);
			return Task.FromResult(result);
		}
	}
}


