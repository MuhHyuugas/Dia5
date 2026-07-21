using Dia5.Domain.Entities;
using Xunit;

namespace Dia5.Domain.Tests;

public class DespesaTests
{
    [Fact]
    public void Deve_LancarExcecao_Quando_SomaDasPartes_DivergirDoValorTotal()
    {
        // Arrange (Configuração do cenário)
        var despesa = new Despesa
        {
            Descricao = "Ingressos Marina Sena",
            ValorTotal = 300.00m,
            Participantes = new List<ParticipanteDespesa>
            {
                new ParticipanteDespesa { ValorDevido = 100.00m },
                new ParticipanteDespesa { ValorDevido = 100.00m },
                new ParticipanteDespesa { ValorDevido = 99.99m } // Soma = 299.99 (diverge de 300.00)
            }
        };

        // Act & Assert (Ação e Validação)
        // Esperamos que uma exceção do tipo InvalidOperationException seja lançada ao validar
        Assert.Throws<InvalidOperationException>(() => despesa.Validar());
    }

        [Fact]
    public void Deve_PassarSemExcecoes_Quando_SomaDasPartes_ForIgualAoValorTotal()
    {
        // Arrange (Configuração: Valor total é 300.00 e a soma das 3 partes também é 300.00)
        var despesa = new Despesa
        {
            Descricao = "Ingressos Marina Sena - Divisao Exata",
            ValorTotal = 300.00m,
            Participantes = new List<ParticipanteDespesa>
            {
                new ParticipanteDespesa { ValorDevido = 100.00m },
                new ParticipanteDespesa { ValorDevido = 100.00m },
                new ParticipanteDespesa { ValorDevido = 100.00m }
            }
        };

        // Act (Ação: Executar o método de validação)
        // Record.Exception captura qualquer erro que acontecer. Se não der erro, retorna null.
        var excecao = Record.Exception(() => despesa.Validar());

        // Assert (Verificação: Garantir que nenhuma exceção foi lançada)
        Assert.Null(excecao);
    }

}
