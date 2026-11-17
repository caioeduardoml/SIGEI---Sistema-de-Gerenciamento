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
}
