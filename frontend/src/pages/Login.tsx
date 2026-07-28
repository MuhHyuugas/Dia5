import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, senha });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background relative overflow-hidden">
      {/* Glow ambiental de fundo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-8 z-10">
        {/* Header */}
        <header className="text-center flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/30">
            D5
          </div>
          <h1 className="text-2xl font-bold text-on-surface mt-2">Dia 5</h1>
          <p className="text-sm text-on-surface-variant">Bem-vindo de volta. Entre na sua conta.</p>
        </header>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">E-mail</label>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 absolute left-3 text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-surface border border-outline rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Senha</label>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 absolute left-3 text-on-surface-variant" />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface border border-outline rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Entrando...' : 'Entrar'}</span>
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        {/* Link para Cadastro */}
        <div className="text-center">
          <p className="text-sm text-on-surface-variant">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Criar uma conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
