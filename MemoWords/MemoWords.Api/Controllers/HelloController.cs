using Microsoft.AspNetCore.Mvc;

namespace MemoWords.Api.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class HelloController : ControllerBase
	{
		[HttpGet]
		public ActionResult<string> Get()
		{
			return "Hello World!";
		}
	}
}

