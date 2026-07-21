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

        public void Validar()
    {
        // 1. Todo usuário (Real ou Convidado) precisa ter um nome
        if (string.IsNullOrWhiteSpace(Nome))
        {
            throw new InvalidOperationException("O nome do usuário é obrigatório.");
        }

        // 2. Regras específicas para Usuário Convidado (Shadow User)
        if (IsGuest)
        {
            if (CriadoPorId == null)
            {
                throw new InvalidOperationException("Um usuário convidado deve obrigatoriamente ter um usuário criador.");
            }

            if (!string.IsNullOrWhiteSpace(Email) || !string.IsNullOrWhiteSpace(SenhaHash))
            {
                throw new InvalidOperationException("Usuários convidados não podem possuir e-mail ou senha.");
            }
        }
        // 3. Regras específicas para Usuário Real
        else
        {
            if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(SenhaHash))
            {
                throw new InvalidOperationException("Usuários reais devem obrigatoriamente possuir e-mail e senha.");
            }
        }
    }


    
}
