using MemoWords.Api.Application.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MemoWords.Api.Controllers
{
	[ApiController]
	[Route("health")]
	public sealed class SystemController : ControllerBase
	{
		[HttpGet]
		[ProducesResponseType(typeof(HealthResponseDto), StatusCodes.Status200OK)]
		[ProducesResponseType(StatusCodes.Status500InternalServerError)]
		public ActionResult<HealthResponseDto> GetHealth()
		{
			return Ok(new HealthResponseDto
			{
				Time = DateTimeOffset.UtcNow
			});
		}
	}
}

