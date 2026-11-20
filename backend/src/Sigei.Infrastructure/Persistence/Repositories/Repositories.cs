using Microsoft.EntityFrameworkCore;
using Sigei.Domain.Entities;
using Sigei.Domain.Enums;
using Sigei.Domain.Interfaces;

namespace Sigei.Infrastructure.Persistence.Repositories;

public sealed class EscolaRepository(SigeiDbContext dbContext) : IEscolaRepository
{
    public async Task<Escola?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await dbContext.Escolas.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<Escola?> ObterPorCodigoVerificacaoAsync(string codigo, CancellationToken cancellationToken = default)
    {
        var normalizado = codigo.Trim().ToUpperInvariant();
        return await dbContext.Escolas.AsNoTracking()
            .FirstOrDefaultAsync(e => e.CodigoVerificacao == normalizado, cancellationToken);
    }

    public async Task<bool> ExisteEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizado = email.Trim().ToLowerInvariant();
        return await dbContext.Escolas.AsNoTracking().AnyAsync(e => e.Email == normalizado, cancellationToken);
    }

    public async Task<IReadOnlyList<Escola>> ListarTodasAsync(CancellationToken cancellationToken = default)
        => await dbContext.Escolas.AsNoTracking().OrderBy(e => e.Nome).ToListAsync(cancellationToken);

    public async Task AdicionarAsync(Escola escola, CancellationToken cancellationToken = default)
        => await dbContext.Escolas.AddAsync(escola, cancellationToken);
}

public sealed class UsuarioRepository(SigeiDbContext dbContext) : IUsuarioRepository
{
    public async Task<Usuario?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await dbContext.Usuarios.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public async Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizado = email.Trim().ToLowerInvariant();
        return await dbContext.Usuarios.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == normalizado, cancellationToken);
    }

    public async Task<bool> ExisteEmailOuCpfAsync(string email, string cpf, CancellationToken cancellationToken = default)
    {
        var emailNorm = email.Trim().ToLowerInvariant();
        var cpfNorm = cpf.Trim();
        return await dbContext.Usuarios.AsNoTracking()
            .AnyAsync(u => u.Email == emailNorm || u.Cpf == cpfNorm, cancellationToken);
    }

    public async Task<IReadOnlyList<Usuario>> ListarProfessoresAsync(
        string? nome,
        string? disciplina,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Usuarios
            .AsNoTracking()
            .Where(u => u.Perfil == PerfilUsuario.Professor);

        if (!string.IsNullOrWhiteSpace(nome))
        {
            var termoNome = nome.Trim().ToLowerInvariant();
            query = query.Where(u => u.Nome.ToLower().Contains(termoNome));
        }

        if (!string.IsNullOrWhiteSpace(disciplina))
        {
            var termoDisc = disciplina.Trim().ToLowerInvariant();
            query = query.Where(u => u.Area.ToLower().Contains(termoDisc));
        }

        return await query.OrderBy(u => u.Nome).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Usuario>> ListarCoordenadoresAsync(CancellationToken cancellationToken = default)
        => await dbContext.Usuarios
            .AsNoTracking()
            .Where(u => u.Perfil == PerfilUsuario.Coordenador)
            .OrderBy(u => u.Nome)
            .ToListAsync(cancellationToken);

    public async Task AdicionarAsync(Usuario usuario, CancellationToken cancellationToken = default)
        => await dbContext.Usuarios.AddAsync(usuario, cancellationToken);

    public void Remover(Usuario usuario)
        => dbContext.Usuarios.Remove(usuario);
}

public sealed class TurmaRepository(SigeiDbContext dbContext) : ITurmaRepository
{
    public async Task<Turma?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await dbContext.Turmas.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    public async Task<Turma?> ObterPorIdComGradeAsync(Guid id, CancellationToken cancellationToken = default)
        => await dbContext.Turmas
            .AsNoTracking()
            .Include(t => t.Horarios)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task<Turma?> ObterPorCodigoComGradeAsync(string codigo, CancellationToken cancellationToken = default)
    {
        var norm = codigo.Trim().ToLowerInvariant();
        return await dbContext.Turmas
            .AsNoTracking()
            .Include(t => t.Horarios)
            .FirstOrDefaultAsync(t => t.Codigo.ToLower() == norm, cancellationToken);
    }

    public async Task<bool> ExisteCodigoAsync(Guid escolaId, string codigo, CancellationToken cancellationToken = default)
    {
        var norm = codigo.Trim().ToLowerInvariant();
        return await dbContext.Turmas
            .AsNoTracking()
            .AnyAsync(t => t.EscolaId == escolaId && t.Codigo.ToLower() == norm, cancellationToken);
    }

    public async Task<IReadOnlyList<Turma>> ListarTodasAsync(CancellationToken cancellationToken = default)
        => await dbContext.Turmas.AsNoTracking().OrderBy(t => t.Nome).ToListAsync(cancellationToken);

    public async Task AdicionarAsync(Turma turma, CancellationToken cancellationToken = default)
        => await dbContext.Turmas.AddAsync(turma, cancellationToken);

    public void Remover(Turma turma)
        => dbContext.Turmas.Remove(turma);
}

public sealed class HorarioAulaRepository(SigeiDbContext dbContext) : IHorarioAulaRepository
{
    public async Task<HorarioAula?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await dbContext.HorariosAula
            .Include(h => h.Turma)
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);

    public async Task<bool> ExisteConflitoProfessorAsync(
        Guid professorId,
        DiaSemana diaSemana,
        string faixaHorario,
        Guid horarioIgnoradoId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.HorariosAula
            .AsNoTracking()
            .AnyAsync(h =>
                h.Id != horarioIgnoradoId &&
                h.ProfessorId == professorId &&
                h.DiaSemana == diaSemana &&
                h.FaixaHorario == faixaHorario &&
                !h.EhIntervalo,
                cancellationToken);
    }

    public async Task AdicionarVariosAsync(IEnumerable<HorarioAula> horarios, CancellationToken cancellationToken = default)
        => await dbContext.HorariosAula.AddRangeAsync(horarios, cancellationToken);
}

public sealed class UnitOfWork(SigeiDbContext dbContext) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => dbContext.SaveChangesAsync(cancellationToken);
}
