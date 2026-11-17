using Sigei.Domain.Common;
using Sigei.Domain.Exceptions;

namespace Sigei.Domain.Entities;

// Representa uma instituicao de ensino cadastrada no SIGEI
public sealed class Escola : BaseEntity
{
    public string Nome { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Telefone { get; private set; } = string.Empty;
    public string Endereco { get; private set; } = string.Empty;
    public string CodigoVerificacao { get; private set; } = string.Empty;

    private readonly List<Usuario> _usuarios = [];
    public IReadOnlyCollection<Usuario> Usuarios => _usuarios.AsReadOnly();

    private readonly List<Turma> _turmas = [];
    public IReadOnlyCollection<Turma> Turmas => _turmas.AsReadOnly();

    private Escola() { }

    public Escola(string nome, string email, string telefone, string endereco, string? codigoVerificacao = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new DomainException("O nome da escola e obrigatorio.");
        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("O e-mail da escola e obrigatorio.");

        Nome = nome.Trim();
        Email = email.Trim().ToLowerInvariant();
        Telefone = telefone.Trim();
        Endereco = endereco.Trim();
        CodigoVerificacao = string.IsNullOrWhiteSpace(codigoVerificacao)
            ? GerarCodigoVerificacao()
            : codigoVerificacao.Trim().ToUpperInvariant();
    }

    private static string GerarCodigoVerificacao()
    {
        return $"SIGEI-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
    }
}
