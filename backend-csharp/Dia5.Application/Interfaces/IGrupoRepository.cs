using Dia5.Domain.Entities;

namespace Dia5.Application.Interfaces;

public interface IGrupoRepository : IRepository<Grupo>
{
    Task<Grupo?> GetByCodigoConviteAsync(string codigoConvite);
    Task<Grupo?> GetGrupoComMembrosAsync(Guid grupoId);
    Task<IEnumerable<Grupo>> GetGruposDoUsuarioAsync(Guid usuarioId);
}
