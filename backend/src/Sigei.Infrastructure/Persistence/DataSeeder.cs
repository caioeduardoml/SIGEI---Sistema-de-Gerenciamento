using Microsoft.EntityFrameworkCore;
using Sigei.Application.Common.Interfaces;
using Sigei.Domain.Entities;
using Sigei.Domain.Enums;

namespace Sigei.Infrastructure.Persistence;

// Popula dados iniciais para demonstracao e desenvolvimento local
public static class DataSeeder
{
    public static async Task SeedAsync(SigeiDbContext dbContext, IPasswordHasher passwordHasher, CancellationToken cancellationToken = default)
    {
        await dbContext.Database.EnsureCreatedAsync(cancellationToken);

        if (await dbContext.Escolas.AnyAsync(cancellationToken))
            return;

        var escola = new Escola(
            "Escola Estadual Modelo SIGEI",
            "contato@sigei.edu.br",
            "(11) 3740-2510",
            "Av. Educacao, 1000 - Centro",
            "SIGEI-2026");

        await dbContext.Escolas.AddAsync(escola, cancellationToken);

        var senhaPadrao = passwordHasher.Hash("Sigei@123");

        var coordenador = new Usuario(
            escola.Id,
            "Coordenacao Pedagogica",
            "COORD-001",
            "111.111.111-11",
            "Ensino Medio e Tecnico",
            "coord@sigei.com",
            senhaPadrao,
            PerfilUsuario.Coordenador,
            aulasTotaisSemestre: 0);

        var profGaby = new Usuario(escola.Id, "Gabriella", "PROF-001", "222.222.222-22", "Matematica", "gabriella@sigei.com", senhaPadrao, PerfilUsuario.Professor, 50);
        profGaby.DefinirMetricasIniciais(8, 2);

        var profCaio = new Usuario(escola.Id, "Caio Gilberto", "PROF-002", "333.333.333-33", "Fisica, Quimica", "caio@sigei.com", senhaPadrao, PerfilUsuario.Professor, 50);
        profCaio.DefinirMetricasIniciais(20, 0);

        var profJoao = new Usuario(escola.Id, "Joao Vitor", "PROF-003", "444.444.444-44", "Portugues, Ingles", "joao@sigei.com", senhaPadrao, PerfilUsuario.Professor, 50);
        profJoao.DefinirMetricasIniciais(9, 3);

        var profMarcio = new Usuario(escola.Id, "Marcio do Sul", "PROF-004", "555.555.555-55", "Geografia, Historia", "marcio@sigei.com", senhaPadrao, PerfilUsuario.Professor, 50);
        profMarcio.DefinirMetricasIniciais(14, 1);

        await dbContext.Usuarios.AddRangeAsync([coordenador, profGaby, profCaio, profJoao, profMarcio], cancellationToken);

        var turmasSpec = new (string Codigo, string Nome, string Curso)[]
        {
            ("1BInfo", "1o Ano B Info", "Informatica"),
            ("1CInfo", "1o Ano C Info", "Informatica"),
            ("2AInfo", "2o Ano A Info", "Informatica"),
            ("2BInfo", "2o Ano B Info", "Informatica"),
            ("2CInfo", "2o Ano C Info", "Informatica"),
            ("3AInfo", "3o Ano A Info", "Informatica"),
            ("3BInfo", "3o Ano B Info", "Informatica"),
            ("1ABio", "1o Ano A Bio", "Biologia"),
            ("1BBio", "1o Ano B Bio", "Biologia"),
            ("2ABio", "2o Ano A Bio", "Biologia"),
            ("2BBio", "2o Ano B Bio", "Biologia"),
            ("3ABio", "3o Ano A Bio", "Biologia")
        };

        var turmas = turmasSpec.Select(t => new Turma(escola.Id, t.Codigo, t.Nome, t.Curso)).ToList();
        await dbContext.Turmas.AddRangeAsync(turmas, cancellationToken);

        var horarios = new List<HorarioAula>();
        var faixas = new (int Ordem, string Faixa, bool Intervalo, string Label)[]
        {
            (1, "08h - 09h", false, "Portugues"),
            (2, "09h - 10h", false, "Portugues"),
            (3, "Intervalo", true, "Intervalo"),
            (4, "10h - 11h", false, "Quimica"),
            (5, "11h - 12h", false, "Quimica"),
            (6, "Almoco", true, "Almoco"),
            (7, "13h - 14h", false, "Matematica"),
            (8, "14h - 15h", false, "Matematica"),
            (9, "Intervalo Tarde", true, "Intervalo"),
            (10, "15h - 16h", false, "Fisica"),
            (11, "16h - 17h", false, "Historia")
        };

        var professores = new[] { profJoao, profCaio, profGaby, profMarcio };

        foreach (var turma in turmas)
        {
            foreach (DiaSemana dia in Enum.GetValues<DiaSemana>())
            {
                foreach (var faixa in faixas)
                {
                    if (faixa.Intervalo)
                    {
                        horarios.Add(new HorarioAula(turma.Id, dia, faixa.Faixa, faixa.Ordem, faixa.Label, null, string.Empty, true));
                        continue;
                    }

                    var (disciplina, prof) = (dia, faixa.Ordem) switch
                    {
                        (DiaSemana.Segunda, 1 or 2) => ("Portugues", profJoao),
                        (DiaSemana.Terca, 1 or 2) => ("Geografia", profMarcio),
                        (DiaSemana.Quarta, 1 or 2) => ("Historia", profMarcio),
                        (DiaSemana.Quinta, 1 or 2) => ("Ingles", profJoao),
                        (DiaSemana.Sexta, 1 or 2) => ("Fisica", profCaio),
                        (DiaSemana.Segunda, 4 or 5) => ("Quimica", profCaio),
                        (DiaSemana.Terca, 4 or 5) => ("Ingles", profJoao),
                        (DiaSemana.Quarta, 4 or 5) => ("Fisica", profCaio),
                        (DiaSemana.Quinta, 4 or 5) => ("Portugues", profJoao),
                        (DiaSemana.Sexta, 4 or 5) => ("Matematica", profGaby),
                        _ => (faixa.Label, professores[(faixa.Ordem + (int)dia) % professores.Length])
                    };

                    horarios.Add(new HorarioAula(turma.Id, dia, faixa.Faixa, faixa.Ordem, disciplina, prof.Id, prof.Nome, false));
                }
            }
        }

        await dbContext.HorariosAula.AddRangeAsync(horarios, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
