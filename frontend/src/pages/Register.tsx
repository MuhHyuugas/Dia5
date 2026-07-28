import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register({ nome, email, senha });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-8 z-10">
        <header className="text-center flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-secondary text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-secondary/30">
            D5
          </div>
          <h1 className="text-2xl font-bold text-on-surface mt-2">Criar Conta</h1>
          <p className="text-sm text-on-surface-variant">Cadastre-se para controlar seus gastos em grupo.</p>
        </header>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Nome Completo</label>
            <div className="relative flex items-center">
              <User className="w-5 h-5 absolute left-3 text-on-surface-variant" />
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
                className="w-full bg-surface border border-outline rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              />
            </div>
          </div>

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
                className="w-full bg-surface border border-outline rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
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
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full bg-surface border border-outline rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white font-semibold py-3.5 rounded-xl hover:bg-secondary-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-secondary/20 mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Cadastrando...' : 'Cadastrar'}</span>
            <UserPlus className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-on-surface-variant">
            Já possui uma conta?{' '}
            <Link to="/login" className="text-secondary font-semibold hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
