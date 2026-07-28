import React, { useEffect, useState } from 'react';
import { groupsService } from '../services/groups.service';
import type { Group, ActivityItem } from '../services/groups.service';
import { ReceiptText, Filter, Calendar } from 'lucide-react';

export const Activity: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroupId && selectedGroupId !== 'ALL') {
      loadGroupActivities(selectedGroupId);
    } else if (groups.length > 0) {
      loadAllActivities(groups);
    }
  }, [selectedGroupId, groups]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const userGroups = await groupsService.getGroups();
      setGroups(userGroups);
      if (userGroups.length > 0) {
        await loadAllActivities(userGroups);
      }
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllActivities = async (userGroups: Group[]) => {
    try {
      setLoading(true);
      const promises = userGroups.map((g) => groupsService.getGroupActivity(g.id));
      const results = await Promise.all(promises);
      const combined = results.flat().sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setActivities(combined);
    } catch (err) {
      console.error('Erro ao carregar histórico geral:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupActivities = async (groupId: string) => {
    try {
      setLoading(true);
      const data = await groupsService.getGroupActivity(groupId);
      setActivities(data);
    } catch (err) {
      console.error('Erro ao carregar histórico do grupo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Extrato & Atividades</h1>
          <p className="text-xs text-on-surface-variant">Histórico cronológico de lançamentos e liquidações.</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-on-surface-variant" />
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="bg-surface border border-outline rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="ALL">Todos os Grupos</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-on-surface-variant">Carregando extrato...</div>
      ) : activities.length === 0 ? (
        <div className="bg-surface p-8 rounded-3xl border border-outline text-center space-y-3">
          <ReceiptText className="w-16 h-16 text-primary mx-auto opacity-40" />
          <h3 className="text-base font-bold text-on-surface">Nenhum lançamento no extrato</h3>
          <p className="text-xs text-on-surface-variant">Suas despesas e acertos de contas aparecerão aqui em ordem cronológica.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-surface p-5 rounded-3xl border border-outline shadow-sm flex items-center justify-between hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl font-bold flex items-center justify-center border ${
                    act.tipo === 'DESPESA'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-secondary/10 text-secondary border-secondary/20'
                  }`}
                >
                  <ReceiptText className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        act.tipo === 'DESPESA' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                      }`}
                    >
                      {act.tipo}
                    </span>
                    <span className="text-xs text-on-surface-variant flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(act.data).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-on-surface mt-1">{act.descricao || 'Acerto de Contas'}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {act.tipo === 'DESPESA' ? `Pago por ${act.pagador}` : `${act.pagador} pagou para ${act.recebedor}`}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-lg font-extrabold ${
                    act.tipo === 'DESPESA' ? 'text-on-surface' : 'text-secondary'
                  }`}
                >
                  R$ {(act.valorTotal || act.valorPago || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
