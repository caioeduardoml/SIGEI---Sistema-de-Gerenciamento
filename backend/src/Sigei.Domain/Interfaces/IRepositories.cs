using Sigei.Domain.Entities;
using Sigei.Domain.Enums;

namespace Sigei.Domain.Interfaces;

public interface IEscolaRepository
{
    Task<Escola?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Escola?> ObterPorCodigoVerificacaoAsync(string codigo, CancellationToken cancellationToken = default);
    Task<bool> ExisteEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Escola>> ListarTodasAsync(CancellationToken cancellationToken = default);
    Task AdicionarAsync(Escola escola, CancellationToken cancellationToken = default);
}

public interface IUsuarioRepository
{
    Task<Usuario?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExisteEmailOuCpfAsync(string email, string cpf, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Usuario>> ListarProfessoresAsync(string? nome, string? disciplina, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Usuario>> ListarCoordenadoresAsync(CancellationToken cancellationToken = default);
    Task AdicionarAsync(Usuario usuario, CancellationToken cancellationToken = default);
    void Remover(Usuario usuario);
}

public interface ITurmaRepository
{
    Task<Turma?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Turma?> ObterPorIdComGradeAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Turma?> ObterPorCodigoComGradeAsync(string codigo, CancellationToken cancellationToken = default);
    Task<bool> ExisteCodigoAsync(Guid escolaId, string codigo, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Turma>> ListarTodasAsync(CancellationToken cancellationToken = default);
    Task AdicionarAsync(Turma turma, CancellationToken cancellationToken = default);
    void Remover(Turma turma);
}

public interface IHorarioAulaRepository
{
    Task<HorarioAula?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExisteConflitoProfessorAsync(Guid professorId, DiaSemana diaSemana, string faixaHorario, Guid horarioIgnoradoId, CancellationToken cancellationToken = default);
    Task AdicionarVariosAsync(IEnumerable<HorarioAula> horarios, CancellationToken cancellationToken = default);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
