using MemoWords.Api.Application.DTOs;
using MemoWords.Api.Application.Requests;
using MemoWords.Api.Application.Services;
using MemoWords.Api.Application.Services.Exceptions;
using MemoWords.Api.Infrastructure.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;

namespace MemoWords.Api.Controllers
{
	[ApiController]
	[Route("api/v1/ai")]
	[Authorize]
	public sealed class AiController : ControllerBase
	{
		private readonly IUserContext _userContext;
		private readonly IAiTranslationService _aiService;

		public AiController(IUserContext userContext, IAiTranslationService aiService)
		{
			_userContext = userContext;
			_aiService = aiService;
		}

		[HttpPost("translate")]
		[EnableRateLimiting("translate")]
		public async Task<ActionResult<TranslateResponseDto>> Translate([FromBody] TranslateRequest request, CancellationToken cancellationToken)
		{
			var userId = _userContext.GetCurrentUserId();

			try
			{
				var result = await _aiService.TranslateAsync(request.SourceText, cancellationToken);

				return Ok(new TranslateResponseDto
				{
					Translation = result.Translation
				});
			}
			catch (AiServiceException ex)
			{
				if (ex.IsTimeout)
				{
					return StatusCode(StatusCodes.Status504GatewayTimeout, Problem(title: "AI timeout", statusCode: StatusCodes.Status504GatewayTimeout));
				}

				return StatusCode(StatusCodes.Status502BadGateway, Problem(title: "AI service error", statusCode: StatusCodes.Status502BadGateway));
			}
			catch (Exception)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, Problem(title: "Internal server error", statusCode: StatusCodes.Status500InternalServerError));
			}
		}
	}
}


