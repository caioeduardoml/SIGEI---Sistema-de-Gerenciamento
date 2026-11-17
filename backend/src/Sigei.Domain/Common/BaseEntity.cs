namespace Sigei.Domain.Common;

// Entidade base com identificador imutavel e rastreamento temporal
public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CriadoEmUtc { get; protected set; } = DateTime.UtcNow;
}
