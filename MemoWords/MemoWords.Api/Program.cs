using FluentValidation;
using FluentValidation.AspNetCore;
using MemoWords.Api.Application.Services;
using MemoWords.Api.Application.Validation;
using MemoWords.Api.Infrastructure.Auth;
using MemoWords.Api.Infrastructure.Persistence;
using MemoWords.Api.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using System.Reflection;

namespace MemoWords.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
			var builder = WebApplication.CreateBuilder(args);

			// DbContext i PostgreSQL
			var connectionString = builder.Configuration.GetConnectionString("Default")
				?? "Host=localhost;Port=5432;Database=memowords;Username=postgres;Password=postgres";

			builder.Services.AddDbContext<ApplicationDbContext>(options =>
			{
				options.UseNpgsql(connectionString);
				options.UseSnakeCaseNamingConvention();
			});

			// FluentValidation
			builder.Services.AddFluentValidationAutoValidation();
			builder.Services.AddValidatorsFromAssemblyContaining<CreateCardRequestValidator>();
			builder.Services.AddValidatorsFromAssemblyContaining<TranslateRequestValidator>();

			// DI
			builder.Services.AddScoped<ICardService, CardService>();
			builder.Services.AddScoped<IAiTranslationService, MockAiTranslationService>();
			builder.Services.AddSingleton<IUserContext, MockUserContext>();

			// Rate Limiting (polityka 'translate')
			builder.Services.AddRateLimiter(options =>
			{
				options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
				options.AddPolicy("translate", httpContext =>
				{
					var userContext = httpContext.RequestServices.GetRequiredService<IUserContext>();
					var key = userContext.GetCurrentUserId().ToString();
					return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
					{
						AutoReplenishment = true,
						PermitLimit = 30,
						QueueLimit = 0,
						Window = TimeSpan.FromMinutes(1)
					});
				});
			});

			builder.Services.AddSwaggerGen();

			builder.Services.AddControllers();
			var app = builder.Build();

			if (app.Environment.IsDevelopment())
			{
				app.UseSwagger();
				app.UseSwaggerUI(c =>
				{
					c.SwaggerEndpoint("/swagger/v1/swagger.json", "MemoWords API v1");
					c.RoutePrefix = "swagger";
				});
			}

			app.UseRateLimiter();

			app.MapControllers();
			app.Run();
        }
    }
}
