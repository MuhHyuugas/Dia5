using Dia5.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dia5.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Amizade> Amizades => Set<Amizade>();
    public DbSet<Grupo> Grupos => Set<Grupo>();
    public DbSet<MembroGrupo> MembrosGrupo => Set<MembroGrupo>();
    public DbSet<Despesa> Despesas => Set<Despesa>();
    public DbSet<ParticipanteDespesa> ParticipantesDespesa => Set<ParticipanteDespesa>();
    public DbSet<Pagamento> Pagamentos => Set<Pagamento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Amizade N:N
        modelBuilder.Entity<Amizade>()
            .HasKey(a => new { a.UsuarioId1, a.UsuarioId2 });

        modelBuilder.Entity<Amizade>()
            .HasOne(a => a.Usuario1)
            .WithMany(u => u.AmizadesIniciadas)
            .HasForeignKey(a => a.UsuarioId1)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Amizade>()
            .HasOne(a => a.Usuario2)
            .WithMany(u => u.AmizadesRecebidas)
            .HasForeignKey(a => a.UsuarioId2)
            .OnDelete(DeleteBehavior.Restrict);

        // MembroGrupo N:N
        modelBuilder.Entity<MembroGrupo>()
            .HasKey(mg => new { mg.GrupoId, mg.UsuarioId });

        modelBuilder.Entity<MembroGrupo>()
            .HasOne(mg => mg.Grupo)
            .WithMany(g => g.Membros)
            .HasForeignKey(mg => mg.GrupoId);

        modelBuilder.Entity<MembroGrupo>()
            .HasOne(mg => mg.Usuario)
            .WithMany(u => u.Grupos)
            .HasForeignKey(mg => mg.UsuarioId);

        // ParticipanteDespesa N:N
        modelBuilder.Entity<ParticipanteDespesa>()
            .HasKey(pd => new { pd.DespesaId, pd.UsuarioId });

        modelBuilder.Entity<ParticipanteDespesa>()
            .HasOne(pd => pd.Despesa)
            .WithMany(d => d.Participantes)
            .HasForeignKey(pd => pd.DespesaId);

        modelBuilder.Entity<ParticipanteDespesa>()
            .HasOne(pd => pd.Usuario)
            .WithMany(u => u.ParticipacoesDespesa)
            .HasForeignKey(pd => pd.UsuarioId);

        // Indices únicos
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.CodigoPerfil)
            .IsUnique();

        modelBuilder.Entity<Grupo>()
            .HasIndex(g => g.CodigoConvite)
            .IsUnique();
            
        // Relacionamentos adicionais Despesa e Pagamento
        modelBuilder.Entity<Despesa>()
            .HasOne(d => d.Pagador)
            .WithMany(u => u.DespesasPagas)
            .HasForeignKey(d => d.PagadorId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<Pagamento>()
            .HasOne(p => p.Pagador)
            .WithMany()
            .HasForeignKey(p => p.PagadorId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<Pagamento>()
            .HasOne(p => p.Recebedor)
            .WithMany()
            .HasForeignKey(p => p.RecebedorId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Usuario - Shadow User
        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.CriadoPor)
            .WithMany()
            .HasForeignKey(u => u.CriadoPorId)
            .OnDelete(DeleteBehavior.SetNull);

        // Soft Delete global para Despesas
        modelBuilder.Entity<Despesa>()
            .HasQueryFilter(d => d.DeletedAt == null);
    }
}
