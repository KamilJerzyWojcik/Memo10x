using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace MemoWords.Api.Infrastructure.Persistence
{
	public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
	{
		public ApplicationDbContext CreateDbContext(string[] args)
		{
			var basePath = Directory.GetCurrentDirectory();

			var configuration = new ConfigurationBuilder()
				.SetBasePath(basePath)
				.AddJsonFile("appsettings.json", optional: true)
				.AddJsonFile("appsettings.Development.json", optional: true)
				.AddEnvironmentVariables()
				.Build();

			var connectionString = configuration.GetConnectionString("Default")
				?? "Host=localhost;Port=5432;Database=memowords;Username=postgres;Password=postgres";

			var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
			optionsBuilder
				.UseNpgsql(connectionString)
				.UseSnakeCaseNamingConvention();

			return new ApplicationDbContext(optionsBuilder.Options);
		}
	}
}


