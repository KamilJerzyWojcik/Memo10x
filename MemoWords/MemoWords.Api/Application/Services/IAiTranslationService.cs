namespace MemoWords.Api.Application.Services
{
	public sealed record class AiTranslationResult(string Translation);

	public interface IAiTranslationService
	{
		Task<AiTranslationResult> TranslateAsync(string sourceText, CancellationToken cancellationToken);
	}
}


