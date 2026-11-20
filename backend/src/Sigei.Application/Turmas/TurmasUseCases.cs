using FluentValidation;
using MediatR;
using Sigei.Domain.Entities;
using Sigei.Domain.Enums;
using Sigei.Domain.Exceptions;
using Sigei.Domain.Interfaces;

namespace Sigei.Application.Turmas;

public sealed record TurmaResumoDto(
    Guid Id,
    string Codigo,
    string Nome,
    string Curso,
    string Turno);

public sealed record HorarioSlotDto(
    Guid Id,
    DiaSemana DiaSemana,
    string FaixaHorario,
    int Ordem,
    string Disciplina,
    Guid? ProfessorId,
    string NomeProfessor,
    bool EhIntervalo);

public sealed record TurmaGradeDto(
    Guid Id,
    string Codigo,
    string Nome,
    string Curso,
    string Turno,
    IReadOnlyList<HorarioSlotDto> Horarios);

public sealed record ListarTurmasQuery : IRequest<IReadOnlyList<TurmaResumoDto>>;

public sealed record ObterTurmaComGradeQuery(string CodigoOuId) : IRequest<TurmaGradeDto>;

public sealed record CriarTurmaCommand(
    Guid EscolaId,
    string Codigo,
    string Nome,
    string Curso,
    string Turno) : IRequest<TurmaResumoDto>;

public sealed record AtualizarTurmaCommand(
    Guid TurmaId,
    string Nome,
    string Curso,
    string Turno,
    Guid? EscolaIdAutenticada = null) : IRequest<TurmaResumoDto>;

public sealed record ExcluirTurmaCommand(Guid TurmaId, Guid? EscolaIdAutenticada = null) : IRequest;

public sealed record AtualizarHorarioSlotCommand(
    Guid HorarioId,
    string Disciplina,
    Guid? ProfessorId,
    string? NomeProfessorCustomizado,
    Guid? EscolaIdAutenticada = null) : IRequest<HorarioSlotDto>;

public sealed class CriarTurmaCommandValidator : AbstractValidator<CriarTurmaCommand>
{
    public CriarTurmaCommandValidator()
    {
        RuleFor(x => x.EscolaId).NotEmpty();
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Curso).NotEmpty().MaximumLength(80);
    }
}

public sealed class AtualizarHorarioSlotCommandValidator : AbstractValidator<AtualizarHorarioSlotCommand>
{
    public AtualizarHorarioSlotCommandValidator()
    {
        RuleFor(x => x.HorarioId).NotEmpty();
        RuleFor(x => x.Disciplina).NotEmpty().MaximumLength(80);
    }
}

public sealed class ListarTurmasQueryHandler(ITurmaRepository turmaRepository)
    : IRequestHandler<ListarTurmasQuery, IReadOnlyList<TurmaResumoDto>>
{
    public async Task<IReadOnlyList<TurmaResumoDto>> Handle(ListarTurmasQuery request, CancellationToken cancellationToken)
    {
        var turmas = await turmaRepository.ListarTodasAsync(cancellationToken);
        return turmas
            .Select(t => new TurmaResumoDto(t.Id, t.Codigo, t.Nome, t.Curso, t.Turno))
            .ToList();
    }
}

public sealed class ObterTurmaComGradeQueryHandler(ITurmaRepository turmaRepository)
    : IRequestHandler<ObterTurmaComGradeQuery, TurmaGradeDto>
{
    public async Task<TurmaGradeDto> Handle(ObterTurmaComGradeQuery request, CancellationToken cancellationToken)
    {
        Turma? turma = Guid.TryParse(request.CodigoOuId, out var id)
            ? await turmaRepository.ObterPorIdComGradeAsync(id, cancellationToken)
            : await turmaRepository.ObterPorCodigoComGradeAsync(request.CodigoOuId, cancellationToken);

        if (turma is null)
            throw new NotFoundException($"Turma '{request.CodigoOuId}' nao encontrada.");

        var slots = turma.Horarios
            .OrderBy(h => h.Ordem)
            .ThenBy(h => h.DiaSemana)
            .Select(h => new HorarioSlotDto(
                h.Id,
                h.DiaSemana,
                h.FaixaHorario,
                h.Ordem,
                h.Disciplina,
                h.ProfessorId,
                h.NomeProfessorExibicao,
                h.EhIntervalo))
            .ToList();

        return new TurmaGradeDto(turma.Id, turma.Codigo, turma.Nome, turma.Curso, turma.Turno, slots);
    }
}

public sealed class CriarTurmaCommandHandler(
    ITurmaRepository turmaRepository,
    IHorarioAulaRepository horarioAulaRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CriarTurmaCommand, TurmaResumoDto>
{
    public async Task<TurmaResumoDto> Handle(CriarTurmaCommand request, CancellationToken cancellationToken)
    {
        if (await turmaRepository.ExisteCodigoAsync(request.EscolaId, request.Codigo, cancellationToken))
            throw new ConflictException($"Ja existe uma turma com o codigo '{request.Codigo}'.");

        var turma = new Turma(request.EscolaId, request.Codigo, request.Nome, request.Curso, request.Turno);
        await turmaRepository.AdicionarAsync(turma, cancellationToken);

        // Gera grade base padrao (8h as 16h com intervalo e almoco) para a nova turma
        var faixas = new (int Ordem, string Faixa, bool Intervalo, string Label)[]
        {
            (1, "08h - 09h", false, "A definir"),
            (2, "09h - 10h", false, "A definir"),
            (3, "Intervalo", true, "Intervalo"),
            (4, "10h - 11h", false, "A definir"),
            (5, "11h - 12h", false, "A definir"),
            (6, "Almoço", true, "Almoço"),
            (7, "13h - 14h", false, "A definir"),
            (8, "14h - 15h", false, "A definir"),
            (9, "Intervalo Tarde", true, "Intervalo"),
            (10, "15h - 16h", false, "A definir"),
            (11, "16h - 17h", false, "A definir")
        };

        var novosSlots = new List<HorarioAula>();
        foreach (DiaSemana dia in Enum.GetValues<DiaSemana>())
        {
            foreach (var faixa in faixas)
            {
                novosSlots.Add(new HorarioAula(
                    turma.Id,
                    dia,
                    faixa.Faixa,
                    faixa.Ordem,
                    faixa.Label,
                    null,
                    faixa.Intervalo ? string.Empty : "Sem professor",
                    faixa.Intervalo));
            }
        }

        await horarioAulaRepository.AdicionarVariosAsync(novosSlots, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new TurmaResumoDto(turma.Id, turma.Codigo, turma.Nome, turma.Curso, turma.Turno);
    }
}

public sealed class AtualizarHorarioSlotCommandHandler(
    IHorarioAulaRepository horarioAulaRepository,
    IUsuarioRepository usuarioRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<AtualizarHorarioSlotCommand, HorarioSlotDto>
{
    public async Task<HorarioSlotDto> Handle(AtualizarHorarioSlotCommand request, CancellationToken cancellationToken)
    {
        var horario = await horarioAulaRepository.ObterPorIdAsync(request.HorarioId, cancellationToken)
            ?? throw new NotFoundException("Slot de horario nao encontrado.");

        if (request.EscolaIdAutenticada.HasValue && horario.Turma is not null &&
            horario.Turma.EscolaId != request.EscolaIdAutenticada.Value)
        {
            throw new UnauthorizedException("Acesso negado para turma de outra escola.");
        }

        string nomeProfessor = request.NomeProfessorCustomizado?.Trim() ?? "Sem professor";

        if (request.ProfessorId.HasValue)
        {
            var professor = await usuarioRepository.ObterPorIdAsync(request.ProfessorId.Value, cancellationToken)
                ?? throw new NotFoundException("Professor selecionado nao encontrado.");

            bool conflito = await horarioAulaRepository.ExisteConflitoProfessorAsync(
                professor.Id,
                horario.DiaSemana,
                horario.FaixaHorario,
                horario.Id,
                cancellationToken);

            if (conflito)
                throw new ConflictException($"O professor {professor.Nome} ja possui aula alocada em {horario.DiaSemana} ({horario.FaixaHorario}).");

            nomeProfessor = professor.Nome;
        }

        horario.AtualizarAlocacao(request.Disciplina, request.ProfessorId, nomeProfessor);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new HorarioSlotDto(
            horario.Id,
            horario.DiaSemana,
            horario.FaixaHorario,
            horario.Ordem,
            horario.Disciplina,
            horario.ProfessorId,
            horario.NomeProfessorExibicao,
            horario.EhIntervalo);
    }
}

public sealed class AtualizarTurmaCommandValidator : AbstractValidator<AtualizarTurmaCommand>
{
    public AtualizarTurmaCommandValidator()
    {
        RuleFor(x => x.TurmaId).NotEmpty();
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Curso).NotEmpty().MaximumLength(80);
    }
}

public sealed class AtualizarTurmaCommandHandler(
    ITurmaRepository turmaRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<AtualizarTurmaCommand, TurmaResumoDto>
{
    public async Task<TurmaResumoDto> Handle(AtualizarTurmaCommand request, CancellationToken cancellationToken)
    {
        var turma = await turmaRepository.ObterPorIdAsync(request.TurmaId, cancellationToken)
            ?? throw new NotFoundException("Turma nao encontrada.");

        if (request.EscolaIdAutenticada.HasValue && turma.EscolaId != request.EscolaIdAutenticada.Value)
            throw new UnauthorizedException("Acesso negado para turma de outra escola.");

        turma.Atualizar(request.Nome, request.Curso, request.Turno);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new TurmaResumoDto(turma.Id, turma.Codigo, turma.Nome, turma.Curso, turma.Turno);
    }
}

public sealed class ExcluirTurmaCommandHandler(
    ITurmaRepository turmaRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<ExcluirTurmaCommand>
{
    public async Task Handle(ExcluirTurmaCommand request, CancellationToken cancellationToken)
    {
        var turma = await turmaRepository.ObterPorIdAsync(request.TurmaId, cancellationToken)
            ?? throw new NotFoundException("Turma nao encontrada.");

        if (request.EscolaIdAutenticada.HasValue && turma.EscolaId != request.EscolaIdAutenticada.Value)
            throw new UnauthorizedException("Acesso negado para turma de outra escola.");

        turmaRepository.Remover(turma);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
