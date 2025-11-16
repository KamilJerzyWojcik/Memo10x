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

			builder.Services.AddDbContext<Infrastructure.Persistence.ApplicationDbContext>(options =>
			{
				options.UseNpgsql(connectionString);
				options.UseSnakeCaseNamingConvention();
			});

			builder.Services.AddControllers();
			var app = builder.Build();
			app.MapControllers();
			app.Run();
        }
    }
}
