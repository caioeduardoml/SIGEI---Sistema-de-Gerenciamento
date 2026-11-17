using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Sigei.Domain.Exceptions;

namespace Sigei.WebApi.Middleware;

// Manipulador global de excecoes padrao RFC 7807 ProblemDetails
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Erro processando requisicao {Method} {Path}",
            httpContext.Request.Method, httpContext.Request.Path);

        var (statusCode, title, detail, errors) = exception switch
        {
            ValidationException validationEx => (
                StatusCodes.Status400BadRequest,
                "Erro de validacao",
                "Um ou mais campos informados sao invalidos.",
                validationEx.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())),
            NotFoundException notFoundEx => (
                StatusCodes.Status404NotFound,
                "Recurso nao encontrado",
                notFoundEx.Message,
                null),
            ConflictException conflictEx => (
                StatusCodes.Status409Conflict,
                "Conflito de dados",
                conflictEx.Message,
                null),
            UnauthorizedException unauthorizedEx => (
                StatusCodes.Status401Unauthorized,
                "Nao autorizado",
                unauthorizedEx.Message,
                null),
            DomainException domainEx => (
                StatusCodes.Status400BadRequest,
                "Regra de negocio violada",
                domainEx.Message,
                null),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Erro interno no servidor",
                "Ocorreu um erro inesperado ao processar sua solicitacao.",
                null)
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        if (errors is not null)
            problemDetails.Extensions["errors"] = errors;

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}
