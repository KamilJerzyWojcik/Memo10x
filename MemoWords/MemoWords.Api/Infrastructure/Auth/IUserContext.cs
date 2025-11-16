using System;

namespace MemoWords.Api.Infrastructure.Auth
{
	public interface IUserContext
	{
		Guid GetCurrentUserId();
	}
}


