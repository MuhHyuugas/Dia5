using Dia5.Application.Interfaces;
using Dia5.Domain.Entities;
using Dia5.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Dia5.Infrastructure.Repositories;

public class UsuarioRepository : Repository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(AppDbContext context) : base(context) { }

    public async Task<Usuario?> GetByCodigoPerfilAsync(string codigoPerfil)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.CodigoPerfil == codigoPerfil);
    }

    public async Task<Usuario?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<IEnumerable<Usuario>> GetShadowUsersByCriadorAsync(Guid criadorId)
    {
        return await _dbSet.Where(u => u.IsGuest && u.CriadoPorId == criadorId).ToListAsync();
    }
}
