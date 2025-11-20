using System.Threading;
using System.Threading.Tasks;

namespace MemoWords.Api.Application.Services
{
    public interface IOpenAiService
    {
        // Metoda generyczna do zwracania ustrukturyzowanych danych
        Task<T> CompleteChatAsync<T>(
            string systemPrompt, 
            string userPrompt, 
            CancellationToken cancellationToken = default);
    }
}

