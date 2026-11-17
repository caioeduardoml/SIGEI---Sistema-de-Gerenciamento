using Sigei.Domain.Entities;

namespace Sigei.Application.Common.Interfaces;

public interface IPasswordHasher
{
    string Hash(string senha);
    bool Verify(string senha, string senhaHash);
}

public interface IJwtTokenGenerator
{
    string GenerateToken(Usuario usuario);
}
