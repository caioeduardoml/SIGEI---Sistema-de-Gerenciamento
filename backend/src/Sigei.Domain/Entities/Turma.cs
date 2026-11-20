using Sigei.Domain.Common;
using Sigei.Domain.Exceptions;

namespace Sigei.Domain.Entities;

// Representa uma turma escolar (ex.: 1 Ano B Informatica)
public sealed class Turma : BaseEntity
{
    public Guid EscolaId { get; private set; }
    public Escola? Escola { get; private set; }
    public string Codigo { get; private set; } = string.Empty;
    public string Nome { get; private set; } = string.Empty;
    public string Curso { get; private set; } = string.Empty;
    public string Turno { get; private set; } = string.Empty;

    private readonly List<HorarioAula> _horarios = [];
    public IReadOnlyCollection<HorarioAula> Horarios => _horarios.AsReadOnly();

    private Turma() { }

    public Turma(Guid escolaId, string codigo, string nome, string curso, string turno = "Integral")
    {
        if (escolaId == Guid.Empty)
            throw new DomainException("A escola vinculada e obrigatoria.");
        if (string.IsNullOrWhiteSpace(codigo))
            throw new DomainException("O codigo da turma e obrigatorio.");
        if (string.IsNullOrWhiteSpace(nome))
            throw new DomainException("O nome da turma e obrigatorio.");

        EscolaId = escolaId;
        Codigo = codigo.Trim();
        Nome = nome.Trim();
        Curso = curso.Trim();
        Turno = turno.Trim();
    }

    public void Atualizar(string nome, string curso, string turno)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new DomainException("O nome da turma e obrigatorio.");
        if (string.IsNullOrWhiteSpace(curso))
            throw new DomainException("O curso da turma e obrigatorio.");

        Nome = nome.Trim();
        Curso = curso.Trim();
        Turno = string.IsNullOrWhiteSpace(turno) ? "Integral" : turno.Trim();
    }
}
