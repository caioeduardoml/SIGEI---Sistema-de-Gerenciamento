using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sigei.Domain.Entities;

namespace Sigei.Infrastructure.Persistence.Configurations;

public sealed class EscolaConfiguration : IEntityTypeConfiguration<Escola>
{
    public void Configure(EntityTypeBuilder<Escola> builder)
    {
        builder.ToTable("Escolas");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Nome).IsRequired().HasMaxLength(150);
        builder.Property(e => e.Email).IsRequired().HasMaxLength(160);
        builder.Property(e => e.Telefone).IsRequired().HasMaxLength(30);
        builder.Property(e => e.Endereco).IsRequired().HasMaxLength(250);
        builder.Property(e => e.CodigoVerificacao).IsRequired().HasMaxLength(32);

        builder.HasIndex(e => e.Email).IsUnique();
        builder.HasIndex(e => e.CodigoVerificacao).IsUnique();
    }
}

public sealed class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("Usuarios");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Nome).IsRequired().HasMaxLength(150);
        builder.Property(u => u.Matricula).IsRequired().HasMaxLength(40);
        builder.Property(u => u.Cpf).IsRequired().HasMaxLength(20);
        builder.Property(u => u.Area).IsRequired().HasMaxLength(120);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(160);
        builder.Property(u => u.SenhaHash).IsRequired().HasMaxLength(256);
        builder.Property(u => u.FotoUrl).HasMaxLength(400);

        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.Cpf).IsUnique();
        builder.HasIndex(u => u.Perfil);

        builder.HasOne(u => u.Escola)
            .WithMany(e => e.Usuarios)
            .HasForeignKey(u => u.EscolaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class TurmaConfiguration : IEntityTypeConfiguration<Turma>
{
    public void Configure(EntityTypeBuilder<Turma> builder)
    {
        builder.ToTable("Turmas");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Codigo).IsRequired().HasMaxLength(30);
        builder.Property(t => t.Nome).IsRequired().HasMaxLength(100);
        builder.Property(t => t.Curso).IsRequired().HasMaxLength(80);
        builder.Property(t => t.Turno).IsRequired().HasMaxLength(30);

        builder.HasIndex(t => new { t.EscolaId, t.Codigo }).IsUnique();

        builder.HasOne(t => t.Escola)
            .WithMany(e => e.Turmas)
            .HasForeignKey(t => t.EscolaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class HorarioAulaConfiguration : IEntityTypeConfiguration<HorarioAula>
{
    public void Configure(EntityTypeBuilder<HorarioAula> builder)
    {
        builder.ToTable("HorariosAula");
        builder.HasKey(h => h.Id);
        builder.Property(h => h.FaixaHorario).IsRequired().HasMaxLength(30);
        builder.Property(h => h.Disciplina).IsRequired().HasMaxLength(80);
        builder.Property(h => h.NomeProfessorExibicao).IsRequired().HasMaxLength(150);

        builder.HasIndex(h => new { h.TurmaId, h.DiaSemana, h.Ordem }).IsUnique();
        builder.HasIndex(h => new { h.ProfessorId, h.DiaSemana, h.FaixaHorario });

        builder.HasOne(h => h.Turma)
            .WithMany(t => t.Horarios)
            .HasForeignKey(h => h.TurmaId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(h => h.Professor)
            .WithMany()
            .HasForeignKey(h => h.ProfessorId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
