namespace Dia5.Domain.Entities;

public class Despesa
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid GrupoId { get; set; }
    public Grupo? Grupo { get; set; }

    public Guid PagadorId { get; set; }
    public Usuario? Pagador { get; set; }

    public string Descricao { get; set; } = string.Empty;
    public decimal ValorTotal { get; set; }
    public DateTime DataCompra { get; set; } = DateTime.UtcNow;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    public ICollection<ParticipanteDespesa> Participantes { get; set; } = new List<ParticipanteDespesa>();

    public  void Validar(){
        var somaPartes = Participantes.Sum(p => p.ValorDevido);

        if (somaPartes != ValorTotal)
        {
            throw new InvalidOperationException("A soma das partes deve ser igual ao valor total.");
        }
    }
}
