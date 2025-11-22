using FluentValidation;
using FluentValidation.AspNetCore;
using MemoWords.Api.Application.Services;
using MemoWords.Api.Application.Validation;
using MemoWords.Api.Infrastructure.Auth;
using MemoWords.Api.Infrastructure.Configuration;
using MemoWords.Api.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace MemoWords.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
			var builder = WebApplication.CreateBuilder(args);
			
			// CORS
			const string corsPolicyName = "AllowLocalhost5173";
			builder.Services.AddCors(options =>
			{
				options.AddPolicy(corsPolicyName, policy =>
				{
					policy
						.WithOrigins("http://localhost:5173", "http://localhost:4173")
						.AllowAnyHeader()
						.AllowAnyMethod();
				});
			});

			// DbContext i PostgreSQL
			var connectionString = builder.Configuration.GetConnectionString("Default");

			builder.Services.AddDbContext<ApplicationDbContext>(options =>
			{
				options.UseNpgsql(connectionString);
				options.UseSnakeCaseNamingConvention();
			});

			// FluentValidation
			builder.Services.AddFluentValidationAutoValidation();
			builder.Services.AddValidatorsFromAssemblyContaining<CreateCardRequestValidator>();
			builder.Services.AddValidatorsFromAssemblyContaining<TranslateRequestValidator>();

			// JWT Bearer (Supabase)
			var supabaseUrl = builder.Configuration["Supabase:Url"];
			var supabaseJwtSecret = builder.Configuration["Supabase:JwtSecret"];
			var signingKeyBytes = Encoding.UTF8.GetBytes(supabaseJwtSecret ?? string.Empty);

			builder.Services
				.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
				.AddJwtBearer(options =>
				{
					options.TokenValidationParameters = new TokenValidationParameters
					{
						ValidateIssuerSigningKey = true,
						IssuerSigningKey = new SymmetricSecurityKey(signingKeyBytes),
						ValidateIssuer = true,
						ValidIssuer = $"{(supabaseUrl ?? string.Empty).TrimEnd('/')}/auth/v1",
						ValidateAudience = true,
						ValidAudience = "authenticated",
						ValidateLifetime = true,
						ClockSkew = TimeSpan.Zero
					};
				});
			builder.Services.AddAuthorization();

			// DI
			builder.Services.Configure<OpenAiSettings>(builder.Configuration.GetSection("OpenAI"));
			builder.Services.AddScoped<ICardService, CardService>();
            builder.Services.AddScoped<IOpenAiService, OpenAiService>();
			// builder.Services.AddScoped<IAiTranslationService, MockAiTranslationService>(); 
            builder.Services.AddScoped<IAiTranslationService, AiTranslationService>();
			builder.Services.AddHttpContextAccessor();
			builder.Services.AddScoped<IUserContext, SupabaseUserContext>();

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

			// CORS middleware
			app.UseCors(corsPolicyName);

			app.UseAuthentication();
			app.UseAuthorization();

			app.UseRateLimiter();

			app.MapControllers();
			app.Run();
        }
    }
}
