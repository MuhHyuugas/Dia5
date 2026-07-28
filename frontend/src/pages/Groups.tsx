import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsService } from '../services/groups.service';
import type { Group } from '../services/groups.service';
import { Modal } from '../components/Modal';
import { Plus, KeyRound, Users, ArrowRight, Check } from 'lucide-react';

export const Groups: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const [nomeGrupo, setNomeGrupo] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsService.getGroups();
      setGroups(data);
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    try {
      const newGroup = await groupsService.createGroup(nomeGrupo);
      setIsCreateOpen(false);
      setNomeGrupo('');
      loadGroups();
      navigate(`/groups/${newGroup.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar grupo.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    try {
      const res = await groupsService.joinGroup(codigoConvite);
      setIsJoinOpen(false);
      setCodigoConvite('');
      loadGroups();
      navigate(`/groups/${res.group.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código de grupo inválido.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Meus Grupos</h1>
          <p className="text-xs text-on-surface-variant">Gerencie suas contas divididas por contexto.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="p-2.5 bg-surface text-primary border border-outline rounded-2xl hover:bg-outline/20 transition-colors btn-active"
            title="Entrar em um grupo com código"
          >
            <KeyRound className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 btn-active"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Grupo</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-on-surface-variant">Carregando grupos...</div>
      ) : groups.length === 0 ? (
        <div className="bg-surface p-8 rounded-3xl border border-outline text-center space-y-4">
          <Users className="w-16 h-16 text-primary mx-auto opacity-40" />
          <div>
            <h3 className="text-base font-bold text-on-surface">Nenhum grupo encontrado</h3>
            <p className="text-xs text-on-surface-variant mt-1">Crie um novo espaço (ex: "Casa", "Viagem") ou entre usando um código de convite.</p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
            >
              Criar Grupo
            </button>
            <button
              onClick={() => setIsJoinOpen(true)}
              className="px-4 py-2.5 bg-surface text-on-surface border border-outline text-xs font-bold rounded-xl"
            >
              Entrar com Código
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              className="bg-surface p-5 rounded-3xl border border-outline shadow-sm hover:border-primary/50 transition-all cursor-pointer space-y-3 group active:scale-[0.99]"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-extrabold text-xl flex items-center justify-center border border-primary/20">
                  {group.nome.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                  {group.codigoConvite}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                  {group.nome}
                </h3>
                <p className="text-xs text-on-surface-variant">Clique para ver membros e lançamentos</p>
              </div>

              <div className="pt-2 border-t border-outline/50 flex justify-between items-center text-xs font-medium text-on-surface-variant">
                <span>Código: <strong>{group.codigoConvite}</strong></span>
                <span className="flex items-center gap-1 text-primary font-bold">
                  Acessar <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Criar Novo Grupo">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          {error && <div className="text-xs text-error bg-error/10 p-3 rounded-xl">{error}</div>}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">Nome do Grupo</label>
            <input
              type="text"
              value={nomeGrupo}
              onChange={(e) => setNomeGrupo(e.target.value)}
              placeholder="Ex: República, Viagem Praia, Churrasco"
              required
              className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors shadow-md disabled:opacity-50"
          >
            {actionLoading ? 'Criando...' : 'Salvar e Gerar Código'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} title="Entrar em um Grupo">
        <form onSubmit={handleJoinGroup} className="space-y-4">
          {error && <div className="text-xs text-error bg-error/10 p-3 rounded-xl">{error}</div>}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">Código de Convite (6 dígitos)</label>
            <input
              type="text"
              value={codigoConvite}
              onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="Ex: REP456"
              required
              className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest uppercase text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-secondary text-white py-3 rounded-xl font-bold text-sm hover:bg-secondary-dark transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{actionLoading ? 'Validando...' : 'Entrar no Grupo'}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};
