using FluentValidation;
using FluentValidation.AspNetCore;
using MemoWords.Api.Application.Services;
using MemoWords.Api.Application.Validation;
using MemoWords.Api.Infrastructure.Auth;
using MemoWords.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

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

			// DI
			builder.Services.AddScoped<ICardService, CardService>();
			builder.Services.AddSingleton<IUserContext, MockUserContext>();

			builder.Services.AddControllers();
			var app = builder.Build();
			app.MapControllers();
			app.Run();
        }
    }
}
