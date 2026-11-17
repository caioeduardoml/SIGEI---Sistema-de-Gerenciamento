using Microsoft.EntityFrameworkCore;
using Sigei.Domain.Entities;

namespace Sigei.Infrastructure.Persistence;

public sealed class SigeiDbContext(DbContextOptions<SigeiDbContext> options) : DbContext(options)
{
    public DbSet<Escola> Escolas => Set<Escola>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Turma> Turmas => Set<Turma>();
    public DbSet<HorarioAula> HorariosAula => Set<HorarioAula>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SigeiDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
