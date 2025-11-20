using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Chat;
using System;
using System.Threading;
using System.Threading.Tasks;
using MemoWords.Api.Infrastructure.Configuration;
using MemoWords.Api.Application.Services.Exceptions;
using System.Text.Json;
using System.ClientModel;

namespace MemoWords.Api.Application.Services
{
    public class OpenAiService : IOpenAiService
    {
        private readonly ChatClient _chatClient;
        private readonly OpenAiSettings _settings;
        private readonly ILogger<OpenAiService> _logger;

        public OpenAiService(
            IOptions<OpenAiSettings> settings,
            ILogger<OpenAiService> logger)
        {
            _settings = settings.Value;
            _logger = logger;

            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            {
                _logger.LogCritical("OpenAI API Key is missing.");
                throw new AiConfigurationException("OpenAI API Key is not configured.");
            }

            try 
            {
                // Inicjalizacja klienta. 
                // OpenAIClient jest thread-safe i może być singletonem, ale tutaj tworzymy go scoped lub transient zależnie od rejestracji serwisu.
                // ChatClient jest lekki.
                var openAiClient = new OpenAIClient(_settings.ApiKey);
                _chatClient = openAiClient.GetChatClient(_settings.ModelName);
            }
            catch (Exception ex)
            {
                 _logger.LogError(ex, "Failed to initialize OpenAI client.");
                 throw new AiConfigurationException($"Failed to initialize OpenAI client: {ex.Message}");
            }
        }

        public async Task<T> CompleteChatAsync<T>(
            string systemPrompt, 
            string userPrompt, 
            CancellationToken cancellationToken = default)
        {
            try
            {
                var messages = new ChatMessage[]
                {
                    new SystemChatMessage(systemPrompt),
                    new UserChatMessage(userPrompt)
                };

                ChatCompletionOptions options = new()
                {
                    ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
                };

                ChatCompletion completion = await _chatClient.CompleteChatAsync(messages, options, cancellationToken);

                if (completion.Content == null || completion.Content.Count == 0)
                {
                    throw new AiServiceException("Received empty response from OpenAI.", "EMPTY_RESPONSE");
                }

                string responseContent = completion.Content[0].Text;

                try 
                {
                    var result = JsonSerializer.Deserialize<T>(responseContent, new JsonSerializerOptions 
                    { 
                        PropertyNameCaseInsensitive = true 
                    });

                    if (result == null)
                         throw new AiServiceException("Failed to deserialize OpenAI response.", "DESERIALIZATION_ERROR");

                    return result;
                }
                catch (JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "JSON Deserialization failed. Content: {Content}", responseContent);
                     throw new AiServiceException("Failed to parse JSON response from AI.", "JSON_PARSE_ERROR", false, jsonEx);
                }
            }
            catch (ClientResultException ex)
            {
                // Obsługa błędów API (401, 429, 500)
                var status = ex.Status;
                
                if (status == 401)
                {
                     _logger.LogCritical(ex, "OpenAI Authentication failed.");
                     throw new AiConfigurationException("Invalid OpenAI API Key.");
                }
                if (status == 429)
                {
                    _logger.LogWarning(ex, "OpenAI Rate limit exceeded.");
                    throw new AiServiceBusyException("AI Service is currently busy. Please try again later.");
                }
                if (status >= 500)
                {
                    _logger.LogError(ex, "OpenAI Server error.");
                     throw new AiServiceUnavailableException("AI Service is currently unavailable.", ex);
                }
                
                _logger.LogError(ex, "OpenAI API error: {Message}", ex.Message);
                throw new AiServiceException($"OpenAI API error: {ex.Message}", "API_ERROR", false, ex);
            }
            catch (Exception ex) when (ex is not AiServiceException)
            {
                _logger.LogError(ex, "Unexpected error in OpenAiService.");
                throw new AiServiceException("An unexpected error occurred while communicating with AI service.", "UNKNOWN_ERROR", false, ex);
            }
        }
    }
}

