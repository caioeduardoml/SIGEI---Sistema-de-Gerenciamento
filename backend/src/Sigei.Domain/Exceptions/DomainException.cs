namespace Sigei.Domain.Exceptions;

// Excecao base para violacoes de regras de negocio
public class DomainException(string message) : Exception(message);

// Excecao lancada quando um recurso solicitado nao existe
public sealed class NotFoundException(string message) : DomainException(message);

// Excecao lancada quando ha conflito de unicidade ou alocacao de horario
public sealed class ConflictException(string message) : DomainException(message);

// Excecao lancada quando credenciais ou permissoes sao invalidas
public sealed class UnauthorizedException(string message) : DomainException(message);
