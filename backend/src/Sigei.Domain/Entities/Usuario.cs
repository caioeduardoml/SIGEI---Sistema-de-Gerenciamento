using Sigei.Domain.Common;
using Sigei.Domain.Enums;
using Sigei.Domain.Exceptions;

namespace Sigei.Domain.Entities;

// Representa um servidor escolar (Coordenador ou Professor)
public sealed class Usuario : BaseEntity
{
    public Guid EscolaId { get; private set; }
    public Escola? Escola { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Matricula { get; private set; } = string.Empty;
    public string Cpf { get; private set; } = string.Empty;
    public string Area { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public PerfilUsuario Perfil { get; private set; }
    public string? FotoUrl { get; private set; }

    // Contabilizacao de carga horaria docente no semestre
    public int AulasTotaisSemestre { get; private set; }
    public int AulasEfetivadas { get; private set; }
    public int Faltas { get; private set; }

    public int AulasRestantes => Math.Max(0, AulasTotaisSemestre - AulasEfetivadas - Faltas);

    private Usuario() { }

    public Usuario(
        Guid escolaId,
        string nome,
        string matricula,
        string cpf,
        string area,
        string email,
        string senhaHash,
        PerfilUsuario perfil,
        int aulasTotaisSemestre = 50,
        string? fotoUrl = null)
    {
        if (escolaId == Guid.Empty)
            throw new DomainException("A escola vinculada e obrigatoria.");
        if (string.IsNullOrWhiteSpace(nome))
            throw new DomainException("O nome completo e obrigatorio.");
        if (string.IsNullOrWhiteSpace(matricula))
            throw new DomainException("A matricula e obrigatoria.");
        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("O e-mail e obrigatorio.");
        if (aulasTotaisSemestre < 0)
            throw new DomainException("O total de aulas nao pode ser negativo.");

        EscolaId = escolaId;
        Nome = nome.Trim();
        Matricula = matricula.Trim();
        Cpf = cpf.Trim();
        Area = area.Trim();
        Email = email.Trim().ToLowerInvariant();
        SenhaHash = senhaHash;
        Perfil = perfil;
        AulasTotaisSemestre = aulasTotaisSemestre;
        FotoUrl = fotoUrl;
    }

    public void RegistrarAulaEfetivada(int quantidade = 1)
    {
        if (Perfil != PerfilUsuario.Professor)
            throw new DomainException("Apenas professores possuem registro de aulas.");
        if (quantidade <= 0)
            throw new DomainException("A quantidade deve ser maior que zero.");
        if (AulasEfetivadas + Faltas + quantidade > AulasTotaisSemestre)
            throw new DomainException("O total de aulas efetivadas e faltas excede a carga horaria do semestre.");

        AulasEfetivadas += quantidade;
    }

    public void RegistrarFalta(int quantidade = 1)
    {
        if (Perfil != PerfilUsuario.Professor)
            throw new DomainException("Apenas professores possuem registro de faltas.");
        if (quantidade <= 0)
            throw new DomainException("A quantidade de faltas deve ser maior que zero.");
        if (AulasEfetivadas + Faltas + quantidade > AulasTotaisSemestre)
            throw new DomainException("O total de aulas efetivadas e faltas excede a carga horaria do semestre.");

        Faltas += quantidade;
    }

    public void DefinirMetricasIniciais(int efetivadas, int faltas)
    {
        if (efetivadas < 0 || faltas < 0 || efetivadas + faltas > AulasTotaisSemestre)
            throw new DomainException("Metricas iniciais de aulas invalidas.");

        AulasEfetivadas = efetivadas;
        Faltas = faltas;
    }
}
