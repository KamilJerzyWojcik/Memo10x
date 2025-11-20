using System.Collections.Generic;

namespace MemoWords.Api.Application.Services
{
    // Wewnętrzny model dla odpowiedzi JSON z AI
    internal class OpenAiTranslationResponse
    {
        public string Translation { get; set; }
        public string ExampleSentence { get; set; }
        public List<string> Synonyms { get; set; }
    }
}

