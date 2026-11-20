using Moq;
using Sigei.Application.Common.Interfaces;
using Sigei.Application.Escolas;
using Sigei.Application.Turmas;
using Sigei.Application.Usuarios;
using Sigei.Domain.Entities;
using Sigei.Domain.Enums;
using Sigei.Domain.Exceptions;
using Sigei.Domain.Interfaces;
using Xunit;

namespace Sigei.UnitTests;

public sealed class UsuarioTests
{
    [Fact]
    public void RegistrarAulaEfetivada_DeveAtualizarRestantesCorretamente()
    {
        var prof = new Usuario(
            Guid.NewGuid(),
            "Gabriella",
            "MAT-01",
            "123.456.789-00",
            "Matematica",
            "gaby@sigei.com",
            "hash",
            PerfilUsuario.Professor,
            aulasTotaisSemestre: 50);

        prof.RegistrarAulaEfetivada(10);
        prof.RegistrarFalta(2);

        Assert.Equal(10, prof.AulasEfetivadas);
        Assert.Equal(2, prof.Faltas);
        Assert.Equal(38, prof.AulasRestantes);
    }

    [Fact]
    public void RegistrarAulaEfetivada_QuandoExcedeTotal_DeveLancarDomainException()
    {
        var prof = new Usuario(
            Guid.NewGuid(),
            "Caio",
            "MAT-02",
            "123.456.789-01",
            "Fisica",
            "caio@sigei.com",
            "hash",
            PerfilUsuario.Professor,
            aulasTotaisSemestre: 5);

        Assert.Throws<DomainException>(() => prof.RegistrarAulaEfetivada(6));
    }
}

public sealed class HandlersTests
{
    [Fact]
    public async Task CadastrarEscola_QuandoEmailUnico_DeveGerarCodigoESalvar()
    {
        var escolaRepo = new Mock<IEscolaRepository>();
        var uow = new Mock<IUnitOfWork>();
        escolaRepo.Setup(r => r.ExisteEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var handler = new CadastrarEscolaCommandHandler(escolaRepo.Object, uow.Object);
        var result = await handler.Handle(
            new CadastrarEscolaCommand("Escola Teste", "teste@escola.com", "3740-2510", "Rua A, 10"),
            CancellationToken.None);

        Assert.Equal("Escola Teste", result.Nome);
        Assert.StartsWith("SIGEI-", result.CodigoVerificacao);
        escolaRepo.Verify(r => r.AdicionarAsync(It.IsAny<Escola>(), It.IsAny<CancellationToken>()), Times.Once);
        uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CadastrarProfessor_ComCodigoInvalido_DeveLancarNotFoundException()
    {
        var escolaRepo = new Mock<IEscolaRepository>();
        var usuarioRepo = new Mock<IUsuarioRepository>();
        var hasher = new Mock<IPasswordHasher>();
        var uow = new Mock<IUnitOfWork>();

        escolaRepo.Setup(r => r.ObterPorCodigoVerificacaoAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Escola?)null);

        var handler = new CadastrarProfessorCommandHandler(
            escolaRepo.Object, usuarioRepo.Object, hasher.Object, uow.Object);

        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(
            new CadastrarProfessorCommand("Prof", "M1", "111", "INVALIDO", "Fisica", "p@e.com", "123456"),
            CancellationToken.None));
    }

    [Fact]
    public async Task AtualizarHorarioSlot_ComConflitoDeProfessor_DeveLancarConflictException()
    {
        var horarioRepo = new Mock<IHorarioAulaRepository>();
        var usuarioRepo = new Mock<IUsuarioRepository>();
        var uow = new Mock<IUnitOfWork>();

        var turmaId = Guid.NewGuid();
        var slot = new HorarioAula(turmaId, DiaSemana.Segunda, "08h - 09h", 1, "Matematica", null, "Sem professor");
        var prof = new Usuario(Guid.NewGuid(), "Joao", "M2", "222", "Portugues", "j@e.com", "h", PerfilUsuario.Professor);

        horarioRepo.Setup(r => r.ObterPorIdAsync(slot.Id, It.IsAny<CancellationToken>())).ReturnsAsync(slot);
        usuarioRepo.Setup(r => r.ObterPorIdAsync(prof.Id, It.IsAny<CancellationToken>())).ReturnsAsync(prof);
        horarioRepo.Setup(r => r.ExisteConflitoProfessorAsync(
                prof.Id, slot.DiaSemana, slot.FaixaHorario, slot.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var handler = new AtualizarHorarioSlotCommandHandler(horarioRepo.Object, usuarioRepo.Object, uow.Object);

        await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(
            new AtualizarHorarioSlotCommand(slot.Id, "Portugues", prof.Id, null),
            CancellationToken.None));
    }

    [Fact]
    public async Task AtualizarProfessor_QuandoEscolaCorresponde_DeveAtualizarDados()
    {
        var usuarioRepo = new Mock<IUsuarioRepository>();
        var uow = new Mock<IUnitOfWork>();
        var escolaId = Guid.NewGuid();
        var prof = new Usuario(escolaId, "Antigo", "M1", "111", "Fisica", "a@e.com", "h", PerfilUsuario.Professor, 50);

        usuarioRepo.Setup(r => r.ObterPorIdAsync(prof.Id, It.IsAny<CancellationToken>())).ReturnsAsync(prof);

        var handler = new AtualizarProfessorCommandHandler(usuarioRepo.Object, uow.Object);
        var result = await handler.Handle(
            new AtualizarProfessorCommand(prof.Id, "Novo Nome", "M2", "111", "Matematica", "n@e.com", 60, escolaId),
            CancellationToken.None);

        Assert.Equal("Novo Nome", result.Nome);
        Assert.Equal(60, result.AulasTotaisSemestre);
        uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExcluirTurma_QuandoEscolaDiferente_DeveLancarUnauthorizedException()
    {
        var turmaRepo = new Mock<ITurmaRepository>();
        var uow = new Mock<IUnitOfWork>();
        var turma = new Turma(Guid.NewGuid(), "1A", "1o Ano A", "Info");

        turmaRepo.Setup(r => r.ObterPorIdAsync(turma.Id, It.IsAny<CancellationToken>())).ReturnsAsync(turma);

        var handler = new ExcluirTurmaCommandHandler(turmaRepo.Object, uow.Object);

        await Assert.ThrowsAsync<UnauthorizedException>(() => handler.Handle(
            new ExcluirTurmaCommand(turma.Id, Guid.NewGuid()),
            CancellationToken.None));
    }

    [Fact]
    public async Task RegistrarAulasEmLote_DeveAtualizarTodosOsProfessoresSelecionados()
    {
        var usuarioRepo = new Mock<IUsuarioRepository>();
        var uow = new Mock<IUnitOfWork>();
        var escolaId = Guid.NewGuid();
        var prof1 = new Usuario(escolaId, "Prof 1", "M1", "111", "Mat", "p1@e.com", "h", PerfilUsuario.Professor, 50);
        var prof2 = new Usuario(escolaId, "Prof 2", "M2", "222", "Fis", "p2@e.com", "h", PerfilUsuario.Professor, 50);

        usuarioRepo.Setup(r => r.ObterPorIdAsync(prof1.Id, It.IsAny<CancellationToken>())).ReturnsAsync(prof1);
        usuarioRepo.Setup(r => r.ObterPorIdAsync(prof2.Id, It.IsAny<CancellationToken>())).ReturnsAsync(prof2);

        var handler = new RegistrarAulasEmLoteCommandHandler(usuarioRepo.Object, uow.Object);
        var result = await handler.Handle(
            new RegistrarAulasEmLoteCommand([prof1.Id, prof2.Id], TipoRegistroAula.Efetivada, 2, escolaId),
            CancellationToken.None);

        Assert.Equal(2, result.Count);
        Assert.All(result, p => Assert.Equal(2, p.AulasEfetivadas));
        uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
