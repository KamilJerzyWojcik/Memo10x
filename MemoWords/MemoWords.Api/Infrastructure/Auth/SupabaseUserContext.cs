using System.Security.Claims;

namespace MemoWords.Api.Infrastructure.Auth
{
	public sealed class SupabaseUserContext : IUserContext
	{
		private readonly IHttpContextAccessor _httpContextAccessor;

		public SupabaseUserContext(IHttpContextAccessor httpContextAccessor)
		{
			_httpContextAccessor = httpContextAccessor;
		}

		public Guid GetCurrentUserId()
		{
			var httpContext = _httpContextAccessor.HttpContext;
			if (httpContext is null)
			{
				throw new UnauthorizedAccessException("Brak kontekstu HTTP.");
			}

			var user = httpContext.User;
			if (user?.Identity?.IsAuthenticated != true)
			{
				throw new UnauthorizedAccessException("Użytkownik niezautoryzowany.");
			}

			// Supabase używa claimu 'sub' jako identyfikatora użytkownika (UUID)
			var sub = user.FindFirstValue("sub")
				?? user.FindFirstValue(ClaimTypes.NameIdentifier);

			if (string.IsNullOrWhiteSpace(sub) || !Guid.TryParse(sub, out var userId))
			{
				throw new UnauthorizedAccessException("Brak poprawnego identyfikatora użytkownika w tokenie.");
			}

			return userId;
		}
	}
}


