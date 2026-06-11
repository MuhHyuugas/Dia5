namespace Dia5.Domain.Entities;

public class ParticipanteDespesa
{
    public Guid DespesaId { get; set; }
    public Despesa? Despesa { get; set; }

    public Guid UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public decimal ValorDevido { get; set; }
}
