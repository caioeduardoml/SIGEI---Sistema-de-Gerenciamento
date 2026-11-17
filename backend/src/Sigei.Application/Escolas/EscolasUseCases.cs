using FluentValidation;
using MediatR;
using Sigei.Domain.Entities;
using Sigei.Domain.Exceptions;
using Sigei.Domain.Interfaces;

namespace Sigei.Application.Escolas;

public sealed record EscolaDto(
    Guid Id,
    string Nome,
    string Email,
    string Telefone,
    string Endereco,
    string CodigoVerificacao);

public sealed record EscolaPublicaDto(
    Guid Id,
    string Nome,
    string Email,
    string Telefone,
    string Endereco);

public sealed record CadastrarEscolaCommand(
    string Nome,
    string Email,
    string Telefone,
    string Endereco) : IRequest<EscolaDto>;

public sealed record ListarEscolasQuery : IRequest<IReadOnlyList<EscolaPublicaDto>>;

public sealed class CadastrarEscolaCommandValidator : AbstractValidator<CadastrarEscolaCommand>
{
    public CadastrarEscolaCommandValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(150).WithMessage("O nome da escola e obrigatorio.");
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Informe um e-mail valido para a escola.");
        RuleFor(x => x.Telefone).NotEmpty().MaximumLength(30).WithMessage("O telefone e obrigatorio.");
        RuleFor(x => x.Endereco).NotEmpty().MaximumLength(250).WithMessage("O endereco e obrigatorio.");
    }
}

public sealed class CadastrarEscolaCommandHandler(
    IEscolaRepository escolaRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CadastrarEscolaCommand, EscolaDto>
{
    public async Task<EscolaDto> Handle(CadastrarEscolaCommand request, CancellationToken cancellationToken)
    {
        if (await escolaRepository.ExisteEmailAsync(request.Email, cancellationToken))
            throw new ConflictException("Ja existe uma escola cadastrada com este e-mail.");

        var escola = new Escola(request.Nome, request.Email, request.Telefone, request.Endereco);
        await escolaRepository.AdicionarAsync(escola, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new EscolaDto(
            escola.Id,
            escola.Nome,
            escola.Email,
            escola.Telefone,
            escola.Endereco,
            escola.CodigoVerificacao);
    }
}

public sealed class ListarEscolasQueryHandler(IEscolaRepository escolaRepository)
    : IRequestHandler<ListarEscolasQuery, IReadOnlyList<EscolaPublicaDto>>
{
    public async Task<IReadOnlyList<EscolaPublicaDto>> Handle(ListarEscolasQuery request, CancellationToken cancellationToken)
    {
        var escolas = await escolaRepository.ListarTodasAsync(cancellationToken);
        return escolas
            .Select(e => new EscolaPublicaDto(e.Id, e.Nome, e.Email, e.Telefone, e.Endereco))
            .ToList();
    }
}
