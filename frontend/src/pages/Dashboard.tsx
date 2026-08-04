import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { groupsService } from '../services/groups.service';
import type { Group } from '../services/groups.service';
import { Plus, Users, Wallet, ArrowRight, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await groupsService.getGroups();
      setGroups(data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <section className="bg-surface p-6 rounded-3xl border border-outline shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Balanço Geral Consolidado
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-secondary">+ R$ 0,00</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Seus saldos estão consolidados em tempo real.</p>
          </div>

          <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/expenses/new')}
            className="flex-1 h-12 bg-primary text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 btn-active"
          >
            <Plus className="w-5 h-5" />
            <span>Lançar Gastos</span>
          </button>

          <button
            onClick={() => navigate('/groups')}
            className="h-12 px-5 bg-background text-on-surface border border-outline rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-outline/30 transition-colors btn-active"
          >
            <Users className="w-5 h-5 text-primary" />
            <span>Meus Grupos</span>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-on-surface">Meus Grupos ({groups.length})</h2>
          <Link to="/groups" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Carregando grupos...</div>
        ) : groups.length === 0 ? (
          <div className="bg-surface p-8 rounded-3xl border border-outline text-center space-y-3">
            <Users className="w-12 h-12 text-on-surface-variant mx-auto opacity-50" />
            <p className="text-sm text-on-surface-variant">Você ainda não participa de nenhum grupo.</p>
            <button
              onClick={() => navigate('/groups')}
              className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors"
            >
              Criar ou Entrar em um Grupo
            </button>
          </div>
        ) : (
          <div className="bg-surface rounded-3xl border border-outline shadow-sm overflow-hidden divide-y divide-outline">
            {groups.slice(0, 4).map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="p-4 flex items-center justify-between hover:bg-background/50 transition-colors cursor-pointer active:bg-background"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold text-lg flex items-center justify-center">
                    {group.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface">{group.nome}</h3>
                    <p className="text-xs text-on-surface-variant">Código: <strong className="text-primary">{group.codigoConvite}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">
                    Ativo
                  </span>
                  <ArrowRight className="w-4 h-4 text-on-surface-variant" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-start gap-3 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => window.location.href = '/account'}>
        <div className="p-2 bg-primary/10 text-primary rounded-xl mt-0.5 shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Aprenda a Usar o Dia 5</h4>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Acesse o <strong className="text-primary">Tutorial de Uso</strong> em "Conta" e domine todas as funcionalidades em 5 passos simples!
          </p>
        </div>
      </section>

      <section className="bg-secondary/5 p-4 rounded-2xl border border-secondary/10 flex items-start gap-3">
        <div className="p-2 bg-secondary/10 text-secondary rounded-xl mt-0.5">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Dica Inteligente Dia 5</h4>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Compartilhe o código do grupo ou adicione Usuários Convidados (Shadow Users) para dividir despesas mesmo com quem não tem o aplicativo!
          </p>
        </div>
      </section>
    </div>
  );
};
