using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sigei.Application.Common.Interfaces;
using Sigei.Domain.Interfaces;
using Sigei.Infrastructure.Persistence;
using Sigei.Infrastructure.Persistence.Repositories;
using Sigei.Infrastructure.Security;

namespace Sigei.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=sigei.db";

        services.AddDbContext<SigeiDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .Validate(o => !string.IsNullOrWhiteSpace(o.SecretKey) && o.SecretKey.Length >= 32,
                "Jwt:SecretKey deve ter pelo menos 32 caracteres.")
            .ValidateOnStart();

        services.AddScoped<IEscolaRepository, EscolaRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ITurmaRepository, TurmaRepository>();
        services.AddScoped<IHorarioAulaRepository, HorarioAulaRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        return services;
    }
}
