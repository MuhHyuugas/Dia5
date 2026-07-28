namespace Dia5.Domain.Entities;

public class MembroGrupo
{
    public Guid GrupoId { get; set; }
    public Grupo? Grupo { get; set; }

    public Guid UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
