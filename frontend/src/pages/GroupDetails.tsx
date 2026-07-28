import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsService } from '../services/groups.service';
import type { ActivityItem } from '../services/groups.service';
import { expensesService } from '../services/expenses.service';
import type { GroupBalanceResponse } from '../services/expenses.service';
import { usersService } from '../services/users.service';
import { Modal } from '../components/Modal';
import { Plus, UserPlus, ArrowLeft, Trash2, Receipt, Wallet } from 'lucide-react';

export const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [balance, setBalance] = useState<GroupBalanceResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);

  // Formulários
  const [guestName, setGuestName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadGroupData();
    }
  }, [id]);

  const loadGroupData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [balanceData, activityData] = await Promise.all([
        expensesService.getGroupBalance(id),
        groupsService.getGroupActivity(id),
      ]);
      setBalance(balanceData);
      setActivity(activityData);
    } catch (err) {
      console.error('Erro ao carregar detalhes do grupo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    try {
      await usersService.createGuest(guestName);
      setIsAddGuestOpen(false);
      setGuestName('');
      loadGroupData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar participante sem app.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;
    if (!window.confirm('Deseja realmente remover este participante do grupo?')) return;

    try {
      await groupsService.removeMember(id, memberId);
      loadGroupData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover participante (saldo deve estar zerado - RN06).');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/groups')}
          className="p-2 bg-surface border border-outline rounded-2xl text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-on-surface">Detalhes do Grupo</h1>
          <p className="text-xs text-on-surface-variant">Acompanhe lançamentos e saldos deste grupo.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-on-surface-variant">Carregando informações...</div>
      ) : (
        <>
          <section className="bg-surface p-6 rounded-3xl border border-outline shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span>Balanço dos Membros</span>
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddGuestOpen(true)}
                  className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Pessoa sem App</span>
                </button>
                <button
                  onClick={() => navigate('/expenses/new')}
                  className="px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Despesa</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-outline border-t border-outline pt-2">
              {balance?.balancoIndividual.map((m) => (
                <div key={m.usuarioId} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                      {m.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{m.nome}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.situacao === 'A Receber'
                            ? 'bg-secondary/10 text-secondary'
                            : m.situacao === 'Devendo'
                            ? 'bg-error/10 text-error'
                            : 'bg-outline/30 text-on-surface-variant'
                        }`}
                      >
                        {m.situacao}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-extrabold ${
                        m.saldoLiquido > 0
                          ? 'text-secondary'
                          : m.saldoLiquido < 0
                          ? 'text-error'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {m.saldoLiquido > 0 ? `+ R$ ${m.saldoLiquido.toFixed(2)}` : m.saldoLiquido < 0 ? `- R$ ${Math.abs(m.saldoLiquido).toFixed(2)}` : 'R$ 0,00'}
                    </span>

                    <button
                      onClick={() => handleRemoveMember(m.usuarioId)}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      title="Remover membro (RN06 exige saldo zero)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2 px-1">
              <Receipt className="w-5 h-5 text-primary" />
              <span>Extrato de Lançamentos ({activity.length})</span>
            </h3>

            {activity.length === 0 ? (
              <div className="bg-surface p-6 rounded-3xl border border-outline text-center text-xs text-on-surface-variant">
                Nenhum lançamento registrado neste grupo ainda.
              </div>
            ) : (
              <div className="space-y-2">
                {activity.map((act) => (
                  <div key={act.id} className="bg-surface p-4 rounded-2xl border border-outline flex justify-between items-center">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${act.tipo === 'DESPESA' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        {act.tipo}
                      </span>
                      <h4 className="text-sm font-semibold text-on-surface mt-1">{act.descricao || 'Acerto de Contas / Pagamento'}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {act.tipo === 'DESPESA' ? `Pago por ${act.pagador}` : `${act.pagador} pagou a ${act.recebedor}`} • {new Date(act.data).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-on-surface">
                        R$ {(act.valorTotal || act.valorPago || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <Modal isOpen={isAddGuestOpen} onClose={() => setIsAddGuestOpen(false)} title="Adicionar Convidado sem App">
        <form onSubmit={handleCreateGuest} className="space-y-4">
          {error && <div className="text-xs text-error bg-error/10 p-3 rounded-xl">{error}</div>}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">Nome da Pessoa</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ex: João (Convidado)"
              required
              className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors shadow-md disabled:opacity-50"
          >
            {actionLoading ? 'Salvando...' : 'Adicionar ao Sistema'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
