namespace Dia5.Domain.Entities;

public class Pagamento
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PagadorId { get; set; }
    public Usuario? Pagador { get; set; }

    public Guid RecebedorId { get; set; }
    public Usuario? Recebedor { get; set; }

    public Guid? GrupoId { get; set; }
    public Grupo? Grupo { get; set; }

    public decimal ValorPago { get; set; }
    public DateTime DataPagamento { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
