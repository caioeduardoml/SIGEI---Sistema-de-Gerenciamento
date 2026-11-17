using FluentValidation;
using MediatR;
using Sigei.Application.Common.Interfaces;
using Sigei.Domain.Entities;
using Sigei.Domain.Enums;
using Sigei.Domain.Exceptions;
using Sigei.Domain.Interfaces;

namespace Sigei.Application.Usuarios;

public sealed record UsuarioCriadoDto(
    Guid Id,
    string Nome,
    string Email,
    string Matricula,
    string Area,
    string Perfil,
    Guid EscolaId);

public sealed record ProfessorDto(
    Guid Id,
    string Nome,
    string Disciplina,
    string Email,
    string Matricula,
    string? FotoUrl,
    int AulasTotaisSemestre,
    int AulasEfetivadas,
    int AulasRestantes,
    int Faltas);

public sealed record CadastrarCoordenadorCommand(
    string Nome,
    string Matricula,
    string Cpf,
    string CodigoEscola,
    string AreaCoordenacao,
    string Email,
    string Senha) : IRequest<UsuarioCriadoDto>;

public sealed record CadastrarProfessorCommand(
    string Nome,
    string Matricula,
    string Cpf,
    string CodigoEscola,
    string AreaAtuacao,
    string Email,
    string Senha,
    int AulasTotaisSemestre = 50) : IRequest<UsuarioCriadoDto>;

public sealed record ListarProfessoresQuery(string? Nome, string? Disciplina)
    : IRequest<IReadOnlyList<ProfessorDto>>;

public enum TipoRegistroAula
{
    Efetivada = 1,
    Falta = 2
}

public sealed record RegistrarAulaProfessorCommand(
    Guid ProfessorId,
    TipoRegistroAula Tipo,
    int Quantidade = 1,
    Guid? EscolaIdAutenticada = null)
    : IRequest<ProfessorDto>;

public sealed class CadastrarCoordenadorCommandValidator : AbstractValidator<CadastrarCoordenadorCommand>
{
    public CadastrarCoordenadorCommandValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Matricula).NotEmpty().MaximumLength(40);
        RuleFor(x => x.Cpf).NotEmpty().MaximumLength(20);
        RuleFor(x => x.CodigoEscola).NotEmpty();
        RuleFor(x => x.AreaCoordenacao).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Senha).NotEmpty().MinimumLength(6).WithMessage("A senha deve ter no minimo 6 caracteres.");
    }
}

public sealed class CadastrarProfessorCommandValidator : AbstractValidator<CadastrarProfessorCommand>
{
    public CadastrarProfessorCommandValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Matricula).NotEmpty().MaximumLength(40);
        RuleFor(x => x.Cpf).NotEmpty().MaximumLength(20);
        RuleFor(x => x.CodigoEscola).NotEmpty();
        RuleFor(x => x.AreaAtuacao).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Senha).NotEmpty().MinimumLength(6).WithMessage("A senha deve ter no minimo 6 caracteres.");
        RuleFor(x => x.AulasTotaisSemestre).GreaterThan(0);
    }
}

public sealed class CadastrarCoordenadorCommandHandler(
    IEscolaRepository escolaRepository,
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CadastrarCoordenadorCommand, UsuarioCriadoDto>
{
    public async Task<UsuarioCriadoDto> Handle(CadastrarCoordenadorCommand request, CancellationToken cancellationToken)
    {
        var escola = await escolaRepository.ObterPorCodigoVerificacaoAsync(request.CodigoEscola, cancellationToken)
            ?? throw new NotFoundException("Codigo de verificacao da escola nao encontrado.");

        if (await usuarioRepository.ExisteEmailOuCpfAsync(request.Email, request.Cpf, cancellationToken))
            throw new ConflictException("Ja existe um servidor cadastrado com este e-mail ou CPF.");

        var usuario = new Usuario(
            escola.Id,
            request.Nome,
            request.Matricula,
            request.Cpf,
            request.AreaCoordenacao,
            request.Email,
            passwordHasher.Hash(request.Senha),
            PerfilUsuario.Coordenador,
            aulasTotaisSemestre: 0);

        await usuarioRepository.AdicionarAsync(usuario, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new UsuarioCriadoDto(
            usuario.Id,
            usuario.Nome,
            usuario.Email,
            usuario.Matricula,
            usuario.Area,
            usuario.Perfil.ToString(),
            usuario.EscolaId);
    }
}

public sealed class CadastrarProfessorCommandHandler(
    IEscolaRepository escolaRepository,
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CadastrarProfessorCommand, UsuarioCriadoDto>
{
    public async Task<UsuarioCriadoDto> Handle(CadastrarProfessorCommand request, CancellationToken cancellationToken)
    {
        var escola = await escolaRepository.ObterPorCodigoVerificacaoAsync(request.CodigoEscola, cancellationToken)
            ?? throw new NotFoundException("Codigo de verificacao da escola nao encontrado.");

        if (await usuarioRepository.ExisteEmailOuCpfAsync(request.Email, request.Cpf, cancellationToken))
            throw new ConflictException("Ja existe um servidor cadastrado com este e-mail ou CPF.");

        var usuario = new Usuario(
            escola.Id,
            request.Nome,
            request.Matricula,
            request.Cpf,
            request.AreaAtuacao,
            request.Email,
            passwordHasher.Hash(request.Senha),
            PerfilUsuario.Professor,
            request.AulasTotaisSemestre);

        await usuarioRepository.AdicionarAsync(usuario, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new UsuarioCriadoDto(
            usuario.Id,
            usuario.Nome,
            usuario.Email,
            usuario.Matricula,
            usuario.Area,
            usuario.Perfil.ToString(),
            usuario.EscolaId);
    }
}

public sealed class ListarProfessoresQueryHandler(IUsuarioRepository usuarioRepository)
    : IRequestHandler<ListarProfessoresQuery, IReadOnlyList<ProfessorDto>>
{
    public async Task<IReadOnlyList<ProfessorDto>> Handle(ListarProfessoresQuery request, CancellationToken cancellationToken)
    {
        var professores = await usuarioRepository.ListarProfessoresAsync(request.Nome, request.Disciplina, cancellationToken);

        return professores
            .Select(p => new ProfessorDto(
                p.Id,
                p.Nome,
                p.Area,
                p.Email,
                p.Matricula,
                p.FotoUrl,
                p.AulasTotaisSemestre,
                p.AulasEfetivadas,
                p.AulasRestantes,
                p.Faltas))
            .ToList();
    }
}

public sealed class RegistrarAulaProfessorCommandHandler(
    IUsuarioRepository usuarioRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<RegistrarAulaProfessorCommand, ProfessorDto>
{
    public async Task<ProfessorDto> Handle(RegistrarAulaProfessorCommand request, CancellationToken cancellationToken)
    {
        var professor = await usuarioRepository.ObterPorIdAsync(request.ProfessorId, cancellationToken)
            ?? throw new NotFoundException("Professor nao encontrado.");

        if (request.EscolaIdAutenticada.HasValue && professor.EscolaId != request.EscolaIdAutenticada.Value)
            throw new UnauthorizedException("Acesso negado para professor de outra escola.");

        if (request.Tipo == TipoRegistroAula.Efetivada)
            professor.RegistrarAulaEfetivada(request.Quantidade);
        else
            professor.RegistrarFalta(request.Quantidade);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProfessorDto(
            professor.Id,
            professor.Nome,
            professor.Area,
            professor.Email,
            professor.Matricula,
            professor.FotoUrl,
            professor.AulasTotaisSemestre,
            professor.AulasEfetivadas,
            professor.AulasRestantes,
            professor.Faltas);
    }
}
