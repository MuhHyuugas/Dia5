namespace Dia5.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? SenhaHash { get; set; }
    public string? CodigoPerfil { get; set; }
    public bool IsGuest { get; set; } = false;
    
    public Guid? CriadoPorId { get; set; }
    public Usuario? CriadoPor { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Amizade> AmizadesIniciadas { get; set; } = new List<Amizade>();
    public ICollection<Amizade> AmizadesRecebidas { get; set; } = new List<Amizade>();
    public ICollection<MembroGrupo> Grupos { get; set; } = new List<MembroGrupo>();
    public ICollection<Despesa> DespesasPagas { get; set; } = new List<Despesa>();
    public ICollection<ParticipanteDespesa> ParticipacoesDespesa { get; set; } = new List<ParticipanteDespesa>();
}
