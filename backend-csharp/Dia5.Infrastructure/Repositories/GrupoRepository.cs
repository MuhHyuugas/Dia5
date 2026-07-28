using Dia5.Application.Interfaces;
using Dia5.Domain.Entities;
using Dia5.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Dia5.Infrastructure.Repositories;

public class GrupoRepository : Repository<Grupo>, IGrupoRepository
{
    public GrupoRepository(AppDbContext context) : base(context) { }

    public async Task<Grupo?> GetByCodigoConviteAsync(string codigoConvite)
    {
        return await _dbSet.FirstOrDefaultAsync(g => g.CodigoConvite == codigoConvite);
    }

    public async Task<Grupo?> GetGrupoComMembrosAsync(Guid grupoId)
    {
        return await _dbSet
            .Include(g => g.Membros)
            .ThenInclude(m => m.Usuario)
            .FirstOrDefaultAsync(g => g.Id == grupoId);
    }

    public async Task<IEnumerable<Grupo>> GetGruposDoUsuarioAsync(Guid usuarioId)
    {
        return await _dbSet
            .Where(g => g.Membros.Any(m => m.UsuarioId == usuarioId))
            .ToListAsync();
    }
}
