using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MemoWords.Api.Application.Services
{
    public class AiTranslationService : IAiTranslationService
    {
        private readonly IOpenAiService _openAiService;
        private readonly ILogger<AiTranslationService> _logger;

        public AiTranslationService(
            IOpenAiService openAiService,
            ILogger<AiTranslationService> logger)
        {
            _openAiService = openAiService;
            _logger = logger;
        }

        public async Task<AiTranslationResult> TranslateAsync(string sourceText, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(sourceText))
            {
                return new AiTranslationResult(string.Empty);
            }

            _logger.LogInformation("Translating text: {SourceText}", sourceText);

            string systemPrompt = @"You are a helpful assistant that translates English words or phrases to Polish.
            You must return a JSON object with the following structure:
            {
                ""translation"": ""The Polish translation""
            }
            Provide the most common and natural translation.
            ";
            string userPrompt = $"Translate the following English text to Polish: \"{sourceText}\"";

            try
            {
                var result = await _openAiService.CompleteChatAsync<OpenAiTranslationResponse>(
                    systemPrompt, 
                    userPrompt, 
                    cancellationToken);

                return new AiTranslationResult(result.Translation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during translation of text: {SourceText}", sourceText);
                throw;
            }
        }
    }
}

