import React, { useEffect, useState } from 'react';
import { friendshipsService } from '../services/friendships.service';
import type { Friend } from '../services/friendships.service';
import { paymentsService } from '../services/payments.service';
import type { GlobalBalanceResponse } from '../services/payments.service';
import { Modal } from '../components/Modal';
import { UserPlus, UsersRound, Trash2, Wallet, Check } from 'lucide-react';

export const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [globalBalance, setGlobalBalance] = useState<GlobalBalanceResponse | null>(null);

  const [codigoPerfil, setCodigoPerfil] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const data = await friendshipsService.getFriends();
      setFriends(data);
    } catch (err) {
      console.error('Erro ao carregar amigos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    try {
      await friendshipsService.addFriend(codigoPerfil);
      setIsAddOpen(false);
      setCodigoPerfil('');
      loadFriends();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao adicionar amigo.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Deseja realmente desfazer a amizade? (Exige saldo zerado - RN06)')) return;

    try {
      await friendshipsService.removeFriend(friendId);
      loadFriends();
      if (selectedFriend?.id === friendId) {
        setSelectedFriend(null);
        setGlobalBalance(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Não é possível desfazer a amizade enquanto houver saldo pendente.');
    }
  };

  const handleSelectFriend = async (friend: Friend) => {
    setSelectedFriend(friend);
    try {
      const bal = await paymentsService.getGlobalBalance(friend.id);
      setGlobalBalance(bal);
    } catch (err) {
      console.error('Erro ao carregar balanço global:', err);
    }
  };

  const handleSettleDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriend) return;
    setError('');

    const valor = parseFloat(valorPago);
    if (isNaN(valor) || valor <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    setActionLoading(true);

    try {
      await paymentsService.settleDebt({
        recebedorId: selectedFriend.id,
        valorPago: valor,
      });

      setIsSettleOpen(false);
      setValorPago('');
      handleSelectFriend(selectedFriend);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar liquidação.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Amigos Conectados</h1>
          <p className="text-xs text-on-surface-variant">Veja os saldos cruzados consolidados entre você e seus amigos.</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 btn-active"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Amigo</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-on-surface-variant">Carregando lista de amigos...</div>
      ) : friends.length === 0 ? (
        <div className="bg-surface p-8 rounded-3xl border border-outline text-center space-y-3">
          <UsersRound className="w-16 h-16 text-primary mx-auto opacity-40" />
          <h3 className="text-base font-bold text-on-surface">Nenhum amigo adicionado</h3>
          <p className="text-xs text-on-surface-variant">Peça o Código de Perfil de 6 caracteres do seu amigo para conectá-los.</p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
          >
            Adicionar Amigo por Código
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => handleSelectFriend(friend)}
              className={`bg-surface p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                selectedFriend?.id === friend.id ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-outline hover:border-primary/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center border border-primary/20">
                    {friend.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">{friend.nome}</h3>
                    <p className="text-xs text-on-surface-variant">Código: <strong className="text-primary">{friend.codigoPerfil}</strong></p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFriend(friend.id);
                  }}
                  className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-colors"
                  title="Desfazer amizade (exige saldo zerado - RN06)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFriend && globalBalance && (
        <section className="bg-surface p-6 rounded-3xl border border-primary/30 shadow-md space-y-4 animate-fadeIn">
          <div className="flex justify-between items-start border-b border-outline pb-4">
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Balanço Global Consolidado (Todos os Grupos)
              </span>
              <h3 className="text-xl font-bold text-on-surface mt-0.5">{globalBalance.amigoNome}</h3>
              <p className="text-sm font-semibold text-primary mt-1">{globalBalance.situacao}</p>
            </div>

            <button
              onClick={() => setIsSettleOpen(true)}
              className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary-dark transition-colors shadow-md flex items-center gap-1.5"
            >
              <Wallet className="w-4 h-4" />
              <span>Liquidar Dívida</span>
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase">Discriminação das Despesas em Comum:</h4>
            {globalBalance.discriminacao.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">Nenhum lançamento pendente no histórico.</p>
            ) : (
              <div className="space-y-1.5">
                {globalBalance.discriminacao.map((item, idx) => (
                  <div key={idx} className="p-3 bg-background rounded-xl border border-outline flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-on-surface">{item.descricao}</span>
                      <span className="text-on-surface-variant ml-2">({item.grupo})</span>
                    </div>
                    <span className={`font-bold ${item.tipo === 'A RECEBER' ? 'text-secondary' : 'text-error'}`}>
                      {item.tipo === 'A RECEBER' ? `+ R$ ${item.valor.toFixed(2)}` : `- R$ ${item.valor.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Adicionar Amigo por Código">
        <form onSubmit={handleAddFriend} className="space-y-4">
          {error && <div className="text-xs text-error bg-error/10 p-3 rounded-xl">{error}</div>}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">Código de Perfil do Amigo (6 dígitos)</label>
            <input
              type="text"
              value={codigoPerfil}
              onChange={(e) => setCodigoPerfil(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="Ex: BRE123"
              required
              className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest uppercase text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors shadow-md disabled:opacity-50"
          >
            {actionLoading ? 'Conectando...' : 'Conectar Amigo'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isSettleOpen} onClose={() => setIsSettleOpen(false)} title={`Liquidar Dívida com ${selectedFriend?.nome}`}>
        <form onSubmit={handleSettleDebt} className="space-y-4">
          {error && <div className="text-xs text-error bg-error/10 p-3 rounded-xl">{error}</div>}
          
          <div className="p-3 bg-background rounded-xl border border-outline text-xs">
            <p className="text-on-surface-variant">Situação Atual:</p>
            <p className="font-bold text-primary text-sm mt-0.5">{globalBalance?.situacao}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">Valor Pago (R$)</label>
            <input
              type="number"
              step="0.01"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              placeholder="0,00"
              required
              className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:border-secondary"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-secondary text-white py-3 rounded-xl font-bold text-sm hover:bg-secondary-dark transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{actionLoading ? 'Registrando...' : 'Confirmar Pagamento'}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};
