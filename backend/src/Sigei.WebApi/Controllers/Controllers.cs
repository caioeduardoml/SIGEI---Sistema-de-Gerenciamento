using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Sigei.Application.Auth;
using Sigei.Application.Escolas;
using Sigei.Application.Turmas;
using Sigei.Application.Usuarios;

namespace Sigei.WebApi.Controllers;

public sealed record AuthUsuarioResponseDto(
    Guid UsuarioId,
    string Nome,
    string Email,
    string Perfil,
    Guid EscolaId);

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(ISender sender) : ControllerBase
{
    private const string CookieNome = "sigei_access_token";

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<AuthUsuarioResponseDto>> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);

        Response.Cookies.Append(CookieNome, result.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddHours(8),
            Path = "/"
        });

        return Ok(new AuthUsuarioResponseDto(
            result.UsuarioId,
            result.Nome,
            result.Email,
            result.Perfil,
            result.EscolaId));
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(CookieNome, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/"
        });
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
public sealed class EscolasController(ISender sender) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<EscolaPublicaDto>>> Listar(CancellationToken cancellationToken)
        => Ok(await sender.Send(new ListarEscolasQuery(), cancellationToken));

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<EscolaDto>> Cadastrar(
        [FromBody] CadastrarEscolaCommand command,
        CancellationToken cancellationToken)
    {
        var escola = await sender.Send(command, cancellationToken);
        return Created($"/api/escolas/{escola.Id}", escola);
    }
}

[ApiController]
[Route("api/[controller]")]
public sealed class CoordenadoresController(ISender sender) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Diretor")]
    public async Task<ActionResult<IReadOnlyList<UsuarioCriadoDto>>> Listar(CancellationToken cancellationToken)
        => Ok(await sender.Send(new ListarCoordenadoresQuery(), cancellationToken));

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<UsuarioCriadoDto>> Cadastrar(
        [FromBody] CadastrarCoordenadorCommand command,
        CancellationToken cancellationToken)
    {
        var usuario = await sender.Send(command, cancellationToken);
        return Created($"/api/coordenadores/{usuario.Id}", usuario);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Diretor")]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken cancellationToken)
    {
        Guid? escolaId = Guid.TryParse(User.FindFirstValue("escolaId"), out var parsed) ? parsed : null;
        await sender.Send(new ExcluirCoordenadorCommand(id, escolaId), cancellationToken);
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ProfessoresController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProfessorDto>>> Listar(
        [FromQuery] string? nome,
        [FromQuery] string? disciplina,
        CancellationToken cancellationToken)
        => Ok(await sender.Send(new ListarProfessoresQuery(nome, disciplina), cancellationToken));

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<UsuarioCriadoDto>> Cadastrar(
        [FromBody] CadastrarProfessorCommand command,
        CancellationToken cancellationToken)
    {
        var usuario = await sender.Send(command, cancellationToken);
        return Created($"/api/professores/{usuario.Id}", usuario);
    }

    [HttpPost("gerenciar")]
    [Authorize(Roles = "Diretor,Coordenador")]
    public async Task<ActionResult<ProfessorDto>> CriarPeloPainel(
        [FromBody] CriarProfessorRequest body,
        CancellationToken cancellationToken)
    {
        var escolaId = ObterEscolaIdAutenticada() ?? Guid.Empty;
        var prof = await sender.Send(
            new CriarProfessorPeloPainelCommand(
                escolaId, body.Nome, body.Matricula, body.Cpf, body.AreaAtuacao, body.Email, body.Senha, body.AulasTotaisSemestre),
            cancellationToken);
        return Created($"/api/professores/{prof.Id}", prof);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Diretor,Coordenador")]
    public async Task<ActionResult<ProfessorDto>> Atualizar(
        Guid id,
        [FromBody] AtualizarProfessorRequest body,
        CancellationToken cancellationToken)
        => Ok(await sender.Send(
            new AtualizarProfessorCommand(
                id, body.Nome, body.Matricula, body.Cpf, body.AreaAtuacao, body.Email, body.AulasTotaisSemestre, ObterEscolaIdAutenticada()),
            cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Diretor,Coordenador")]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken cancellationToken)
    {
        await sender.Send(new ExcluirProfessorCommand(id, ObterEscolaIdAutenticada()), cancellationToken);
        return NoContent();
    }

    [HttpPatch("{id:guid}/aulas")]
    [Authorize(Roles = "Diretor,Coordenador")]
    public async Task<ActionResult<ProfessorDto>> RegistrarAula(
        Guid id,
        [FromBody] RegistrarAulaRequest body,
        CancellationToken cancellationToken)
        => Ok(await sender.Send(
            new RegistrarAulaProfessorCommand(id, body.Tipo, body.Quantidade, ObterEscolaIdAutenticada()),
            cancellationToken));

    [HttpPost("aulas-lote")]
    [Authorize(Roles = "Diretor,Coordenador")]
    public async Task<ActionResult<IReadOnlyList<ProfessorDto>>> RegistrarAulasEmLote(
        [FromBody] RegistrarAulasLoteRequest body,
        CancellationToken cancellationToken)
        => Ok(await sender.Send(
            new RegistrarAulasEmLoteCommand(body.ProfessorIds, body.Tipo, body.Quantidade, ObterEscolaIdAutenticada()),
            cancellationToken));

    private Guid? ObterEscolaIdAutenticada()
        => Guid.TryParse(User.FindFirstValue("escolaId"), out var id) ? id : null;
}

public sealed record CriarProfessorRequest(
    string Nome,
    string Matricula,
    string Cpf,
    string AreaAtuacao,
    string Email,
    string Senha,
    int AulasTotaisSemestre = 50);

public sealed record AtualizarProfessorRequest(
    string Nome,
    string Matricula,
    string Cpf,
    string AreaAtuacao,
    string Email,
    int AulasTotaisSemestre);

public sealed record RegistrarAulaRequest(TipoRegistroAula Tipo, int Quantidade = 1);
public sealed record RegistrarAulasLoteRequest(IReadOnlyList<Guid> ProfessorIds, TipoRegistroAula Tipo, int Quantidade = 1);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class TurmasController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TurmaResumoDto>>> Listar(CancellationToken cancellationToken)
        => Ok(await sender.Send(new ListarTurmasQuery(), cancellationToken));

    [HttpGet("{codigoOuId}")]
    public async Task<ActionResult<TurmaGradeDto>> ObterComGrade(
        string codigoOuId,
        CancellationToken cancellationToken)
        => Ok(await sender.Send(new ObterTurmaComGradeQuery(codigoOuId), cancellationToken));

    [HttpPost]
    [Authorize(Roles = "Diretor,Coordenador")]
    public async Task<ActionResult<TurmaResumoDto>> Criar(
        [FromBody] CriarTurmaRequest body,
        CancellationToken cancellationToken)
    {
        var escolaId = ObterEscolaIdAutenticada();
        var turma = await sender.Send(
            new CriarTurmaCommand(escolaId, body.Codigo, body.Nome, body.Curso, body.Turno),
            cancellationToken);
        return Created($"/api/turmas/{turma.Codigo}", turma);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Diretor,Coordenador")]
    public async Task<ActionResult<TurmaResumoDto>> Atualizar(
        Guid id,
        [FromBody] AtualizarTurmaRequest body,
        CancellationToken cancellationToken)
        => Ok(await sender.Send(
            new AtualizarTurmaCommand(id, body.Nome, body.Curso, body.Turno, ObterEscolaIdAutenticada()),
            cancellationToken));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Diretor,Coordenador")]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken cancellationToken)
    {
        await sender.Send(new ExcluirTurmaCommand(id, ObterEscolaIdAutenticada()), cancellationToken);
        return NoContent();
    }

    [HttpPut("horarios/{horarioId:guid}")]
    [Authorize(Roles = "Diretor,Coordenador")]
    public async Task<ActionResult<HorarioSlotDto>> AtualizarHorario(
        Guid horarioId,
        [FromBody] AtualizarHorarioRequest body,
        CancellationToken cancellationToken)
        => Ok(await sender.Send(
            new AtualizarHorarioSlotCommand(horarioId, body.Disciplina, body.ProfessorId, body.NomeProfessorCustomizado, ObterEscolaIdAutenticada()),
            cancellationToken));

    private Guid ObterEscolaIdAutenticada()
        => Guid.TryParse(User.FindFirstValue("escolaId"), out var id) ? id : Guid.Empty;
}

public sealed record CriarTurmaRequest(string Codigo, string Nome, string Curso, string Turno = "Integral");
public sealed record AtualizarTurmaRequest(string Nome, string Curso, string Turno = "Integral");
public sealed record AtualizarHorarioRequest(string Disciplina, Guid? ProfessorId, string? NomeProfessorCustomizado);
