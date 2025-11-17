using System;

namespace MemoWords.Api.Application.Services.Exceptions
{
	public sealed class AiServiceException : Exception
	{
		public string ErrorCode { get; }
		public bool IsTimeout { get; }

		public AiServiceException(string message, string errorCode, bool isTimeout = false, Exception? innerException = null)
			: base(message, innerException)
		{
			ErrorCode = errorCode;
			IsTimeout = isTimeout;
		}
	}
}


