using System;

namespace MemoWords.Api.Infrastructure.Auth
{
	public sealed class MockUserContext : IUserContext
	{
		private static readonly Guid DevUserId = Guid.Parse("d8985899-2145-4139-a92e-1e35b8bc6f83");

		public Guid GetCurrentUserId() => DevUserId;
	}
}


