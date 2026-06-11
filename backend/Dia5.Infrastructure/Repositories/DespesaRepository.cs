using Dia5.Application.Interfaces;
using Dia5.Domain.Entities;
using Dia5.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Dia5.Infrastructure.Repositories;

public class DespesaRepository : Repository<Despesa>, IDespesaRepository
{
    public DespesaRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Despesa>> GetDespesasDoGrupoAsync(Guid grupoId)
    {
        return await _dbSet
            .Include(d => d.Pagador)
            .Where(d => d.GrupoId == grupoId && d.DeletedAt == null)
            .OrderByDescending(d => d.DataCompra)
            .ToListAsync();
    }

    public async Task<Despesa?> GetDespesaComParticipantesAsync(Guid despesaId)
    {
        return await _dbSet
            .Include(d => d.Participantes)
            .ThenInclude(p => p.Usuario)
            .FirstOrDefaultAsync(d => d.Id == despesaId);
    }
}
