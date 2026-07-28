using Dia5.Domain.Entities;

namespace Dia5.Application.Interfaces;

public interface IUsuarioRepository : IRepository<Usuario>
{
    Task<Usuario?> GetByCodigoPerfilAsync(string codigoPerfil);
    Task<Usuario?> GetByEmailAsync(string email);
    Task<IEnumerable<Usuario>> GetShadowUsersByCriadorAsync(Guid criadorId);
}
