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

public sealed record RegistrarAulasEmLoteCommand(
    IReadOnlyList<Guid> ProfessorIds,
    TipoRegistroAula Tipo,
    int Quantidade = 1,
    Guid? EscolaIdAutenticada = null)
    : IRequest<IReadOnlyList<ProfessorDto>>;

public sealed record CriarProfessorPeloPainelCommand(
    Guid EscolaId,
    string Nome,
    string Matricula,
    string Cpf,
    string AreaAtuacao,
    string Email,
    string Senha,
    int AulasTotaisSemestre = 50) : IRequest<ProfessorDto>;

public sealed record AtualizarProfessorCommand(
    Guid ProfessorId,
    string Nome,
    string Matricula,
    string Cpf,
    string AreaAtuacao,
    string Email,
    int AulasTotaisSemestre,
    Guid? EscolaIdAutenticada = null) : IRequest<ProfessorDto>;

public sealed record ExcluirProfessorCommand(Guid ProfessorId, Guid? EscolaIdAutenticada = null) : IRequest;

public sealed record ListarCoordenadoresQuery : IRequest<IReadOnlyList<UsuarioCriadoDto>>;

public sealed record ExcluirCoordenadorCommand(Guid CoordenadorId, Guid? EscolaIdAutenticada = null) : IRequest;

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

public sealed class CriarProfessorPeloPainelCommandValidator : AbstractValidator<CriarProfessorPeloPainelCommand>
{
    public CriarProfessorPeloPainelCommandValidator()
    {
        RuleFor(x => x.EscolaId).NotEmpty();
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Matricula).NotEmpty().MaximumLength(40);
        RuleFor(x => x.Cpf).NotEmpty().MaximumLength(20);
        RuleFor(x => x.AreaAtuacao).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Senha).NotEmpty().MinimumLength(6);
        RuleFor(x => x.AulasTotaisSemestre).GreaterThan(0);
    }
}

public sealed class CriarProfessorPeloPainelCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CriarProfessorPeloPainelCommand, ProfessorDto>
{
    public async Task<ProfessorDto> Handle(CriarProfessorPeloPainelCommand request, CancellationToken cancellationToken)
    {
        if (await usuarioRepository.ExisteEmailOuCpfAsync(request.Email, request.Cpf, cancellationToken))
            throw new ConflictException("Ja existe um servidor cadastrado com este e-mail ou CPF.");

        var prof = new Usuario(
            request.EscolaId,
            request.Nome,
            request.Matricula,
            request.Cpf,
            request.AreaAtuacao,
            request.Email,
            passwordHasher.Hash(request.Senha),
            PerfilUsuario.Professor,
            request.AulasTotaisSemestre);

        await usuarioRepository.AdicionarAsync(prof, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProfessorDto(
            prof.Id,
            prof.Nome,
            prof.Area,
            prof.Email,
            prof.Matricula,
            prof.FotoUrl,
            prof.AulasTotaisSemestre,
            prof.AulasEfetivadas,
            prof.AulasRestantes,
            prof.Faltas);
    }
}

public sealed class AtualizarProfessorCommandValidator : AbstractValidator<AtualizarProfessorCommand>
{
    public AtualizarProfessorCommandValidator()
    {
        RuleFor(x => x.ProfessorId).NotEmpty();
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Matricula).NotEmpty().MaximumLength(40);
        RuleFor(x => x.Cpf).NotEmpty().MaximumLength(20);
        RuleFor(x => x.AreaAtuacao).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.AulasTotaisSemestre).GreaterThan(0);
    }
}

public sealed class AtualizarProfessorCommandHandler(
    IUsuarioRepository usuarioRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<AtualizarProfessorCommand, ProfessorDto>
{
    public async Task<ProfessorDto> Handle(AtualizarProfessorCommand request, CancellationToken cancellationToken)
    {
        var prof = await usuarioRepository.ObterPorIdAsync(request.ProfessorId, cancellationToken)
            ?? throw new NotFoundException("Professor nao encontrado.");

        if (prof.Perfil != PerfilUsuario.Professor)
            throw new DomainException("O usuario informado nao possui perfil de professor.");

        if (request.EscolaIdAutenticada.HasValue && prof.EscolaId != request.EscolaIdAutenticada.Value)
            throw new UnauthorizedException("Acesso negado para professor de outra escola.");

        prof.AtualizarDados(
            request.Nome,
            request.Matricula,
            request.Cpf,
            request.AreaAtuacao,
            request.Email,
            request.AulasTotaisSemestre);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProfessorDto(
            prof.Id,
            prof.Nome,
            prof.Area,
            prof.Email,
            prof.Matricula,
            prof.FotoUrl,
            prof.AulasTotaisSemestre,
            prof.AulasEfetivadas,
            prof.AulasRestantes,
            prof.Faltas);
    }
}

public sealed class ExcluirProfessorCommandHandler(
    IUsuarioRepository usuarioRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<ExcluirProfessorCommand>
{
    public async Task Handle(ExcluirProfessorCommand request, CancellationToken cancellationToken)
    {
        var prof = await usuarioRepository.ObterPorIdAsync(request.ProfessorId, cancellationToken)
            ?? throw new NotFoundException("Professor nao encontrado.");

        if (prof.Perfil != PerfilUsuario.Professor)
            throw new DomainException("O usuario informado nao possui perfil de professor.");

        if (request.EscolaIdAutenticada.HasValue && prof.EscolaId != request.EscolaIdAutenticada.Value)
            throw new UnauthorizedException("Acesso negado para professor de outra escola.");

        usuarioRepository.Remover(prof);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class ListarCoordenadoresQueryHandler(IUsuarioRepository usuarioRepository)
    : IRequestHandler<ListarCoordenadoresQuery, IReadOnlyList<UsuarioCriadoDto>>
{
    public async Task<IReadOnlyList<UsuarioCriadoDto>> Handle(ListarCoordenadoresQuery request, CancellationToken cancellationToken)
    {
        var coords = await usuarioRepository.ListarCoordenadoresAsync(cancellationToken);
        return coords
            .Select(c => new UsuarioCriadoDto(
                c.Id, c.Nome, c.Email, c.Matricula, c.Area, c.Perfil.ToString(), c.EscolaId))
            .ToList();
    }
}

public sealed class ExcluirCoordenadorCommandHandler(
    IUsuarioRepository usuarioRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<ExcluirCoordenadorCommand>
{
    public async Task Handle(ExcluirCoordenadorCommand request, CancellationToken cancellationToken)
    {
        var coord = await usuarioRepository.ObterPorIdAsync(request.CoordenadorId, cancellationToken)
            ?? throw new NotFoundException("Coordenador nao encontrado.");

        if (coord.Perfil != PerfilUsuario.Coordenador)
            throw new DomainException("Apenas coordenadores podem ser removidos por este recurso.");

        if (request.EscolaIdAutenticada.HasValue && coord.EscolaId != request.EscolaIdAutenticada.Value)
            throw new UnauthorizedException("Acesso negado para coordenador de outra escola.");

        usuarioRepository.Remover(coord);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public sealed class RegistrarAulasEmLoteCommandValidator : AbstractValidator<RegistrarAulasEmLoteCommand>
{
    public RegistrarAulasEmLoteCommandValidator()
    {
        RuleFor(x => x.ProfessorIds).NotEmpty().WithMessage("Selecione ao menos um professor.");
        RuleFor(x => x.Quantidade).GreaterThan(0).WithMessage("A quantidade deve ser maior que zero.");
    }
}

public sealed class RegistrarAulasEmLoteCommandHandler(
    IUsuarioRepository usuarioRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<RegistrarAulasEmLoteCommand, IReadOnlyList<ProfessorDto>>
{
    public async Task<IReadOnlyList<ProfessorDto>> Handle(
        RegistrarAulasEmLoteCommand request,
        CancellationToken cancellationToken)
    {
        var atualizados = new List<ProfessorDto>();

        foreach (var profId in request.ProfessorIds.Distinct())
        {
            var professor = await usuarioRepository.ObterPorIdAsync(profId, cancellationToken)
                ?? throw new NotFoundException($"Professor '{profId}' nao encontrado.");

            if (request.EscolaIdAutenticada.HasValue && professor.EscolaId != request.EscolaIdAutenticada.Value)
                throw new UnauthorizedException("Acesso negado para professor de outra escola.");

            if (request.Tipo == TipoRegistroAula.Efetivada)
                professor.RegistrarAulaEfetivada(request.Quantidade);
            else
                professor.RegistrarFalta(request.Quantidade);

            atualizados.Add(new ProfessorDto(
                professor.Id,
                professor.Nome,
                professor.Area,
                professor.Email,
                professor.Matricula,
                professor.FotoUrl,
                professor.AulasTotaisSemestre,
                professor.AulasEfetivadas,
                professor.AulasRestantes,
                professor.Faltas));
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return atualizados;
    }
}
