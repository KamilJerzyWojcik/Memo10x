namespace MemoWords.Api.Infrastructure.Configuration
{
    public class OpenAiSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://api.openai.com/v1";
        public string ModelName { get; set; } = "gpt-4o-mini";
    }
}

