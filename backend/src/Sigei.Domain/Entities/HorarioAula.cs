using Sigei.Domain.Common;
using Sigei.Domain.Enums;
using Sigei.Domain.Exceptions;

namespace Sigei.Domain.Entities;

// Representa um horario especifico na grade semanal de uma turma
public sealed class HorarioAula : BaseEntity
{
    public Guid TurmaId { get; private set; }
    public Turma? Turma { get; private set; }
    public DiaSemana DiaSemana { get; private set; }
    public string FaixaHorario { get; private set; } = string.Empty;
    public int Ordem { get; private set; }
    public string Disciplina { get; private set; } = string.Empty;
    public Guid? ProfessorId { get; private set; }
    public Usuario? Professor { get; private set; }
    public string NomeProfessorExibicao { get; private set; } = string.Empty;
    public bool EhIntervalo { get; private set; }

    private HorarioAula() { }

    public HorarioAula(
        Guid turmaId,
        DiaSemana diaSemana,
        string faixaHorario,
        int ordem,
        string disciplina,
        Guid? professorId,
        string nomeProfessorExibicao,
        bool ehIntervalo = false)
    {
        if (turmaId == Guid.Empty)
            throw new DomainException("A turma e obrigatoria.");
        if (string.IsNullOrWhiteSpace(faixaHorario))
            throw new DomainException("A faixa de horario e obrigatoria.");
        if (!ehIntervalo && string.IsNullOrWhiteSpace(disciplina))
            throw new DomainException("A disciplina e obrigatoria para horarios de aula.");

        TurmaId = turmaId;
        DiaSemana = diaSemana;
        FaixaHorario = faixaHorario.Trim();
        Ordem = ordem;
        Disciplina = disciplina.Trim();
        ProfessorId = professorId;
        NomeProfessorExibicao = nomeProfessorExibicao.Trim();
        EhIntervalo = ehIntervalo;
    }

    public void AtualizarAlocacao(string disciplina, Guid? professorId, string nomeProfessorExibicao)
    {
        if (EhIntervalo)
            throw new DomainException("Nao e possivel alocar aula em horario de intervalo ou almoco.");
        if (string.IsNullOrWhiteSpace(disciplina))
            throw new DomainException("A disciplina e obrigatoria.");

        Disciplina = disciplina.Trim();
        ProfessorId = professorId;
        NomeProfessorExibicao = nomeProfessorExibicao.Trim();
    }
}
