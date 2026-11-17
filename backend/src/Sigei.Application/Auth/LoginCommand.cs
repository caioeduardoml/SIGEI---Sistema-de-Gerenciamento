using FluentValidation;
using MediatR;
using Sigei.Application.Common.Interfaces;
using Sigei.Domain.Exceptions;
using Sigei.Domain.Interfaces;

namespace Sigei.Application.Auth;

public sealed record LoginCommand(string Email, string Senha) : IRequest<LoginResponseDto>;

public sealed record LoginResponseDto(
    string Token,
    Guid UsuarioId,
    string Nome,
    string Email,
    string Perfil,
    Guid EscolaId);

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Informe um e-mail valido.");
        RuleFor(x => x.Senha).NotEmpty().WithMessage("A senha e obrigatoria.");
    }
}

public sealed class LoginCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator)
    : IRequestHandler<LoginCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var usuario = await usuarioRepository.ObterPorEmailAsync(request.Email, cancellationToken);
        if (usuario is null || !passwordHasher.Verify(request.Senha, usuario.SenhaHash))
            throw new UnauthorizedException("E-mail ou senha invalidos.");

        var token = jwtTokenGenerator.GenerateToken(usuario);

        return new LoginResponseDto(
            token,
            usuario.Id,
            usuario.Nome,
            usuario.Email,
            usuario.Perfil.ToString(),
            usuario.EscolaId);
    }
}
