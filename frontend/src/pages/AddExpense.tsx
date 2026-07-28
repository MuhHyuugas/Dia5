import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsService } from '../services/groups.service';
import type { Group } from '../services/groups.service';
import { expensesService } from '../services/expenses.service';
import type { GroupBalanceResponse } from '../services/expenses.service';
import { authService } from '../services/auth.service';
import { ArrowLeft, Check, AlertCircle, Calculator } from 'lucide-react';

export const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [balance, setBalance] = useState<GroupBalanceResponse | null>(null);

  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [pagadorId, setPagadorId] = useState(currentUser?.userId || '');
  const [dataCompra, setDataCompra] = useState(new Date().toISOString().split('T')[0]);

  const [participantShares, setParticipantShares] = useState<{ [usuarioId: string]: string }>({});

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupMembers(selectedGroupId);
    }
  }, [selectedGroupId]);

  const loadGroups = async () => {
    try {
      const data = await groupsService.getGroups();
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroupId(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      const bal = await expensesService.getGroupBalance(groupId);
      setBalance(bal);
      setParticipantShares({});
    } catch (err) {
      console.error('Erro ao carregar membros do grupo:', err);
    }
  };

  const handleAutoSplitEqual = () => {
    if (!balance || !valorTotal) return;
    const total = parseFloat(valorTotal);
    if (isNaN(total) || total <= 0) return;

    const count = balance.balancoIndividual.length;
    if (count === 0) return;

    const share = (total / count).toFixed(2);
    const shares: { [usuarioId: string]: string } = {};
    balance.balancoIndividual.forEach((m) => {
      shares[m.usuarioId] = share;
    });
    setParticipantShares(shares);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const total = parseFloat(valorTotal);
    if (isNaN(total) || total <= 0) {
      setError('Informe um valor total válido.');
      return;
    }

    const participantesList = Object.entries(participantShares)
      .map(([usuarioId, valStr]) => ({
        usuarioId,
        valorDevido: parseFloat(valStr) || 0,
      }))
      .filter((p) => p.valorDevido > 0);

    if (participantesList.length === 0) {
      setError('Defina os valores devidos pelos participantes.');
      return;
    }

    const somaPartes = participantesList.reduce((sum, p) => sum + p.valorDevido, 0);
    if (Math.abs(somaPartes - total) > 0.01) {
      setError(
        `A soma das partes (R$ ${somaPartes.toFixed(
          2,
        )}) deve ser estritamente igual ao valor total pago (R$ ${total.toFixed(2)}).`,
      );
      return;
    }

    setLoading(true);

    try {
      await expensesService.createExpense({
        grupoId: selectedGroupId,
        pagadorId,
        descricao,
        valorTotal: total,
        dataCompra,
        participantes: participantesList,
      });

      navigate(`/groups/${selectedGroupId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar despesa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-surface border border-outline rounded-2xl text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-on-surface">Lançar Nova Despesa</h1>
          <p className="text-xs text-on-surface-variant">Registre um gasto e defina a divisão do valor.</p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-2xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant uppercase">Grupo</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full bg-surface border border-outline rounded-2xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome} (Código: {g.codigoConvite})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">Descrição da Compra</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Conta de Luz, Uber, Mercado"
              required
              className="w-full bg-surface border border-outline rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">Valor Total (R$)</label>
            <input
              type="number"
              step="0.01"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder="0,00"
              required
              className="w-full bg-surface border border-outline rounded-2xl px-4 py-3 text-sm font-bold text-primary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">Quem Pagou?</label>
            <select
              value={pagadorId}
              onChange={(e) => setPagadorId(e.target.value)}
              className="w-full bg-surface border border-outline rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
            >
              {balance?.balancoIndividual.map((m) => (
                <option key={m.usuarioId} value={m.usuarioId}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">Data da Compra</label>
            <input
              type="date"
              value={dataCompra}
              onChange={(e) => setDataCompra(e.target.value)}
              className="w-full bg-surface border border-outline rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-3xl border border-outline space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-on-surface">Divisão entre Participantes</h3>
            <button
              type="button"
              onClick={handleAutoSplitEqual}
              className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Divisão Igualitária</span>
            </button>
          </div>

          <div className="space-y-3">
            {balance?.balancoIndividual.map((m) => (
              <div key={m.usuarioId} className="flex justify-between items-center gap-4">
                <span className="text-sm font-semibold text-on-surface">{m.nome}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={participantShares[m.usuarioId] || ''}
                    onChange={(e) =>
                      setParticipantShares({
                        ...participantShares,
                        [m.usuarioId]: e.target.value,
                      })
                    }
                    placeholder="0,00"
                    className="w-28 bg-background border border-outline rounded-xl px-3 py-1.5 text-sm text-right font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 btn-active"
        >
          <Check className="w-5 h-5" />
          <span>{loading ? 'Validando e Registrando...' : 'Salvar Despesa'}</span>
        </button>
      </form>
    </div>
  );
};
