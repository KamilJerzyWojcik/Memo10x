using MemoWords.Api.Application.DTOs;
using MemoWords.Api.Application.Requests;
using MemoWords.Api.Application.Services;
using MemoWords.Api.Infrastructure.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace MemoWords.Api.Controllers
{
    [ApiController]
    [Route("api/v1/cards")]
	[Authorize]
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

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<CardDto>> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var userId = _userContext.GetCurrentUserId();

            var card = await _cardService.GetCardByIdAsync(userId, id, cancellationToken);
            if (card is null)
            {
                _logger.LogWarning("Card {CardId} not found for user {UserId}", id, userId);
                return NotFound();
            }

            var dto = card.CreateCardDto();
            _logger.LogInformation("Fetched card {CardId} for user {UserId}", dto.Id, userId);

            return Ok(dto);
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
            var dto = card.CreateCardDto();

            _logger.LogInformation("Created card {CardId} for user {UserId}", dto.Id, userId);

            return Created($"/api/v1/cards/{dto.Id}", dto);
        }

        [HttpPatch("{id:guid}")]
        public async Task<ActionResult<CardDto>> Update([FromRoute] Guid id, [FromBody] UpdateCardRequestDto request, CancellationToken cancellationToken)
        {
            var userId = _userContext.GetCurrentUserId();

            var card = await _cardService.UpdateCardAsync(userId, id, request.SourceText, request.TargetText, cancellationToken);
            if (card is null)
            {
                _logger.LogWarning("Card {CardId} not found for user {UserId} during update", id, userId);
                return NotFound();
            }

            var dto = card.CreateCardDto();
            _logger.LogInformation("Updated card {CardId} for user {UserId}", dto.Id, userId);

            return Ok(dto);
        }

		[HttpDelete("{id:guid}")]
		public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
		{
			var userId = _userContext.GetCurrentUserId();

			var deleted = await _cardService.DeleteCardAsync(userId, id, cancellationToken);
			if (!deleted)
			{
				_logger.LogWarning("Card {CardId} not found for user {UserId} during delete", id, userId);
				return NotFound();
			}

			_logger.LogInformation("Deleted card {CardId} for user {UserId}", id, userId);
			return NoContent();
		}
    }
}


