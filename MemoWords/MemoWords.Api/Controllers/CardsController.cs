using MemoWords.Api.Application.DTOs;
using MemoWords.Api.Application.Mappers;
using MemoWords.Api.Application.Requests;
using MemoWords.Api.Application.Services;
using MemoWords.Api.Infrastructure.Auth;
using Microsoft.AspNetCore.Mvc;

namespace MemoWords.Api.Controllers
{
	[ApiController]
	[Route("api/v1/cards")]
	public sealed class CardsController : ControllerBase
	{
		private readonly IUserContext _userContext;
		private readonly ICardService _cardService;
		private readonly ILogger<CardsController> _logger;

		public CardsController(IUserContext userContext, ICardService cardService, ILogger<CardsController> logger)
		{
			_userContext = userContext;
			_cardService = cardService;
			_logger = logger;
		}

		[HttpGet]
		public async Task<ActionResult<PagedResultDto<CardDto>>> List([FromQuery] GetCardsQuery query, CancellationToken cancellationToken)
		{
			var userId = _userContext.GetCurrentUserId();

			var result = await _cardService.GetCardsAsync(userId, query.Page, query.PageSize, cancellationToken);

			_logger.LogInformation("Listed cards for user {UserId}: page {Page}, size {PageSize}, total {Total}", userId, result.Page, result.PageSize, result.Total);

			return Ok(result);
		}

		[HttpPost]
		public async Task<ActionResult<CardDto>> Create([FromBody] CreateCardRequest request, CancellationToken cancellationToken)
		{
			var userId = _userContext.GetCurrentUserId();

			var card = await _cardService.CreateCardAsync(userId, request.SourceText, request.TargetText, cancellationToken);
			var dto = CardMapper.ToDto(card);

			_logger.LogInformation("Created card {CardId} for user {UserId}", dto.Id, userId);

			return Created($"/api/v1/cards/{dto.Id}", dto);
		}
	}
}


