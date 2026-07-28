namespace Dia5.Domain.Entities;

public class Grupo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string CodigoConvite { get; set; } = string.Empty;
    
    public Guid CriadoPorId { get; set; }
    public Usuario? CriadoPor { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MembroGrupo> Membros { get; set; } = new List<MembroGrupo>();
    public ICollection<Despesa> Despesas { get; set; } = new List<Despesa>();
}
