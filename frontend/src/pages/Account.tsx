import React, { useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { usersService } from '../services/users.service';
import type { UserProfile } from '../services/users.service';
import { Modal } from '../components/Modal';
import { Mail, Copy, Check, Link2, LogOut, KeyRound } from 'lucide-react';

export const Account: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Vincular Perfil Fantasma
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [shadowUserId, setShadowUserId] = useState('');
  const [codigoPerfilReal, setCodigoPerfilReal] = useState('');

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await usersService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (profile?.codigoPerfil) {
      navigator.clipboard.writeText(profile.codigoPerfil);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkShadowUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const res = await usersService.linkShadowUser(shadowUserId, codigoPerfilReal);
      setSuccess(res.message);
      setShadowUserId('');
      setCodigoPerfilReal('');
      setTimeout(() => {
        setIsLinkOpen(false);
        setSuccess('');
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao vincular perfil fantasma.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-xl mx-auto">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-on-surface">Minha Conta & Perfil</h1>
        <p className="text-xs text-on-surface-variant">Gerencie suas informações e o seu Código de Perfil único.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-on-surface-variant">Carregando dados do perfil...</div>
      ) : (
        <>
          <section className="bg-surface p-6 rounded-3xl border border-outline shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-primary text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                {profile?.nome.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-xl font-bold text-on-surface">{profile?.nome}</h2>
                <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {profile?.email || 'Sem e-mail (Usuário Convidado)'}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary">
                  Conta Real Verificada
                </span>
              </div>
            </div>

            <div className="bg-background p-4 rounded-2xl border border-outline space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Meu Código de Perfil Único
                </span>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <p className="text-2xl font-extrabold text-primary tracking-widest uppercase">
                {profile?.codigoPerfil || 'N/A'}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Forneça este código de 6 caracteres para seus amigos conectarem você ou vincularem o seu histórico financeiro!
              </p>
            </div>
          </section>

          <section className="bg-surface rounded-3xl border border-outline shadow-sm overflow-hidden divide-y divide-outline">
            <div
              onClick={() => setIsLinkOpen(true)}
              className="p-5 flex items-center justify-between hover:bg-background/50 transition-colors cursor-pointer active:bg-background"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Vincular Perfil Fantasma (Shadow User)</h3>
                  <p className="text-xs text-on-surface-variant">Transfira o histórico de uma pessoa sem app para uma conta real.</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => authService.logout()}
              className="p-5 flex items-center justify-between hover:bg-error/5 transition-colors cursor-pointer text-error"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-error/10 text-error rounded-2xl">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Encerrar Sessão</h3>
                  <p className="text-xs text-error/70">Fazer logout do aplicativo Dia 5 neste dispositivo.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <Modal isOpen={isLinkOpen} onClose={() => setIsLinkOpen(false)} title="Vincular Perfil Fantasma a Conta Real">
        <form onSubmit={handleLinkShadowUser} className="space-y-4">
          {error && <div className="text-xs text-error bg-error/10 p-3 rounded-xl">{error}</div>}
          {success && <div className="text-xs text-secondary bg-secondary/10 p-3 rounded-xl font-bold">{success}</div>}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">ID do Usuário Convidado (Shadow User)</label>
            <input
              type="text"
              value={shadowUserId}
              onChange={(e) => setShadowUserId(e.target.value)}
              placeholder="UUID do perfil fantasma que você criou"
              required
              className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase">Código de Perfil da Conta Real (6 dígitos)</label>
            <input
              type="text"
              value={codigoPerfilReal}
              onChange={(e) => setCodigoPerfilReal(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="Ex: MUR998"
              required
              className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest uppercase text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Link2 className="w-4 h-4" />
            <span>{actionLoading ? 'Executando Migração...' : 'Transferir Histórico e Deletar Convidado'}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};
