using System;

namespace MemoWords.Api.Application.Services.Exceptions
{
	public class AiServiceException : Exception
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

    public class AiConfigurationException : AiServiceException
    {
        public AiConfigurationException(string message) 
            : base(message, "CONFIGURATION_ERROR") { }
    }

    public class AiServiceBusyException : AiServiceException
    {
        public AiServiceBusyException(string message) 
            : base(message, "SERVICE_BUSY") { }
    }

    public class AiServiceUnavailableException : AiServiceException
    {
        public AiServiceUnavailableException(string message, Exception? inner = null) 
            : base(message, "SERVICE_UNAVAILABLE", false, inner) { }
    }

    public class AiValidationException : AiServiceException
    {
        public AiValidationException(string message) 
            : base(message, "VALIDATION_ERROR") { }
    }
}
