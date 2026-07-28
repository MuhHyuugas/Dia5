using Dia5.Domain.Entities;
using Xunit;

namespace Dia5.Domain.Tests;

public class UsuarioTests
{
    [Fact]
    public void Deve_LancarExcecao_Quando_UsuarioConvidado_NaoPossuirCriador()
    {
        // Arrange (Criando um convidado sem CriadoPorId)
        var usuarioConvidado = new Usuario
        {
            Nome = "Convidado Sem Criador",
            IsGuest = true,
            CriadoPorId = null // Viola a regra RN02!
        };

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => usuarioConvidado.Validar());
    }
        [Fact]
    public void Deve_PassarSemExcecoes_Quando_UsuarioConvidado_ForValido()
    {
        // Arrange: Convidado com Nome e CriadoPorId preenchidos
        var usuarioConvidado = new Usuario
        {
            Nome = "Murilo Convidado",
            IsGuest = true,
            CriadoPorId = Guid.NewGuid()
        };

        // Act & Assert
        var excecao = Record.Exception(() => usuarioConvidado.Validar());
        Assert.Null(excecao);
    }

    [Fact]
    public void Deve_PassarSemExcecoes_Quando_UsuarioReal_ForValido()
    {
        // Arrange: Usuário real com Nome, E-mail e Senha
        var usuarioReal = new Usuario
        {
            Nome = "Brennda Santos",
            IsGuest = false,
            Email = "brennda@email.com",
            SenhaHash = "hash123"
        };

        // Act & Assert
        var excecao = Record.Exception(() => usuarioReal.Validar());
        Assert.Null(excecao);
    }


    
}
