namespace Dia5.Domain.Entities;

public class Amizade
{
    public Guid UsuarioId1 { get; set; }
    public Usuario? Usuario1 { get; set; }

    public Guid UsuarioId2 { get; set; }
    public Usuario? Usuario2 { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
