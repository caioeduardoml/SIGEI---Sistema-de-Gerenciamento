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
            "Av. Educação, 1000 - Centro",
            "SIGEI-2026");

        await dbContext.Escolas.AddAsync(escola, cancellationToken);

        var senhaPadrao = passwordHasher.Hash("Sigei@123");

        var diretor = new Usuario(
            escola.Id,
            "Diretoria Geral",
            "DIR-001",
            "000.000.000-00",
            "Direção Escolar",
            "diretor@sigei.com",
            senhaPadrao,
            PerfilUsuario.Diretor,
            aulasTotaisSemestre: 0);

        var coordenador = new Usuario(
            escola.Id,
            "Coordenação Pedagógica",
            "COORD-001",
            "111.111.111-11",
            "Ensino Médio e Técnico",
            "coord@sigei.com",
            senhaPadrao,
            PerfilUsuario.Coordenador,
            aulasTotaisSemestre: 0);

        var profGaby = new Usuario(escola.Id, "Gabriella", "PROF-001", "222.222.222-22", "Matemática", "gabriella@sigei.com", senhaPadrao, PerfilUsuario.Professor, 50);
        profGaby.DefinirMetricasIniciais(8, 2);

        var profCaio = new Usuario(escola.Id, "Caio Gilberto", "PROF-002", "333.333.333-33", "Física, Química", "caio@sigei.com", senhaPadrao, PerfilUsuario.Professor, 50);
        profCaio.DefinirMetricasIniciais(20, 0);

        var profJoao = new Usuario(escola.Id, "João Vitor", "PROF-003", "444.444.444-44", "Português, Inglês", "joao@sigei.com", senhaPadrao, PerfilUsuario.Professor, 50);
        profJoao.DefinirMetricasIniciais(9, 3);

        var profMarcio = new Usuario(escola.Id, "Márcio do Sul", "PROF-004", "555.555.555-55", "Geografia, História", "marcio@sigei.com", senhaPadrao, PerfilUsuario.Professor, 50);
        profMarcio.DefinirMetricasIniciais(14, 1);

        await dbContext.Usuarios.AddRangeAsync([diretor, coordenador, profGaby, profCaio, profJoao, profMarcio], cancellationToken);

        var turmasSpec = new (string Codigo, string Nome, string Curso)[]
        {
            ("1BInfo", "1º Ano B Info", "Informática"),
            ("1CInfo", "1º Ano C Info", "Informática"),
            ("2AInfo", "2º Ano A Info", "Informática"),
            ("2BInfo", "2º Ano B Info", "Informática"),
            ("2CInfo", "2º Ano C Info", "Informática"),
            ("3AInfo", "3º Ano A Info", "Informática"),
            ("3BInfo", "3º Ano B Info", "Informática"),
            ("1ABio", "1º Ano A Bio", "Biologia"),
            ("1BBio", "1º Ano B Bio", "Biologia"),
            ("2ABio", "2º Ano A Bio", "Biologia"),
            ("2BBio", "2º Ano B Bio", "Biologia"),
            ("3ABio", "3º Ano A Bio", "Biologia")
        };

        var turmas = turmasSpec.Select(t => new Turma(escola.Id, t.Codigo, t.Nome, t.Curso)).ToList();
        await dbContext.Turmas.AddRangeAsync(turmas, cancellationToken);

        var horarios = new List<HorarioAula>();
        var faixas = new (int Ordem, string Faixa, bool Intervalo, string Label)[]
        {
            (1, "08h - 09h", false, "Português"),
            (2, "09h - 10h", false, "Português"),
            (3, "Intervalo", true, "Intervalo"),
            (4, "10h - 11h", false, "Química"),
            (5, "11h - 12h", false, "Química"),
            (6, "Almoço", true, "Almoço"),
            (7, "13h - 14h", false, "Matemática"),
            (8, "14h - 15h", false, "Matemática"),
            (9, "Intervalo Tarde", true, "Intervalo"),
            (10, "15h - 16h", false, "Física"),
            (11, "16h - 17h", false, "História")
        };

        // Mapeamento consistente: cada disciplina possui um unico professor titular na turma
        Usuario ObterTitular(string disciplina) => disciplina switch
        {
            "Português" or "Inglês" => profJoao,
            "Matemática" => profGaby,
            "Física" or "Química" => profCaio,
            _ => profMarcio
        };

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

                    string disciplina = (dia, faixa.Ordem) switch
                    {
                        (DiaSemana.Segunda, 1 or 2) => "Português",
                        (DiaSemana.Terca, 1 or 2) => "Geografia",
                        (DiaSemana.Quarta, 1 or 2) => "História",
                        (DiaSemana.Quinta, 1 or 2) => "Inglês",
                        (DiaSemana.Sexta, 1 or 2) => "Física",
                        (DiaSemana.Segunda, 4 or 5) => "Química",
                        (DiaSemana.Terca, 4 or 5) => "Inglês",
                        (DiaSemana.Quarta, 4 or 5) => "Física",
                        (DiaSemana.Quinta, 4 or 5) => "Português",
                        (DiaSemana.Sexta, 4 or 5) => "Matemática",
                        (DiaSemana.Segunda, 7 or 8) => "Matemática",
                        (DiaSemana.Terca, 7 or 8) => "Português",
                        (DiaSemana.Quarta, 7 or 8) => "Química",
                        (DiaSemana.Quinta, 7 or 8) => "História",
                        (DiaSemana.Sexta, 7 or 8) => "Geografia",
                        (_, 10) => "Física",
                        _ => "História"
                    };

                    var prof = ObterTitular(disciplina);
                    horarios.Add(new HorarioAula(turma.Id, dia, faixa.Faixa, faixa.Ordem, disciplina, prof.Id, prof.Nome, false));
                }
            }
        }

        await dbContext.HorariosAula.AddRangeAsync(horarios, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
