using Dia5.Domain.Entities;

namespace Dia5.Application.Interfaces;

public interface IDespesaRepository : IRepository<Despesa>
{
    Task<IEnumerable<Despesa>> GetDespesasDoGrupoAsync(Guid grupoId);
    Task<Despesa?> GetDespesaComParticipantesAsync(Guid despesaId);
}
