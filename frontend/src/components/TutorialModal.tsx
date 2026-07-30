import React, { useState } from 'react';
import { Modal } from './Modal';
import { Users, PlusCircle, UserPlus, Wallet, CheckCircle2, ArrowRight, ChevronLeft } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_SLIDES = [
  {
    id: '1',
    icon: Users,
    colorClass: 'text-primary bg-primary/10 border-primary/20',
    title: 'Bem-vindo ao Dia 5! 👋',
    subtitle: 'Divisão de Contas sem Estresse',
    description:
      'O Dia 5 foi feito para você gerenciar despesas compartilhadas com amigos, repúblicas, viagens e festas de forma simples e transparente.',
  },
  {
    id: '2',
    icon: Users,
    colorClass: 'text-secondary bg-secondary/10 border-secondary/20',
    title: 'Criar ou Entrar em Grupos 🏠',
    subtitle: 'Código de Convite de 6 Dígitos',
    description:
      'Crie grupos para cada ocasião (ex: "Casa") ou entre no grupo do seu amigo usando o Código de Convite de 6 caracteres (ex: REP456).',
  },
  {
    id: '3',
    icon: PlusCircle,
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    title: 'Divisão Inteligente de Contas 💸',
    subtitle: 'Divisão Igualitária ou Cotas',
    description:
      'Lance despesas e escolha entre divisão igualitária com 1 clique ou cotas personalizadas. O sistema valida se as partes somam o valor total pago!',
  },
  {
    id: '4',
    icon: UserPlus,
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    title: 'Convidados sem App (Shadow Users) 👤',
    subtitle: 'Ninguém Fica de Fora',
    description:
      'Adicione participantes sem o aplicativo como Convidados. Quando a pessoa se cadastrar, vincule o histórico e transfira o saldo!',
  },
  {
    id: '5',
    icon: Wallet,
    colorClass: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    title: 'Conecte Amigos & Acerto de Contas 🤝',
    subtitle: 'Balanço Global & Liquidação',
    description:
      'Compartilhe seu Código de Perfil único, veja o saldo consolidado entre todos os grupos e registre acertos de contas em 1 clique.',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentIndex < TUTORIAL_SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const slide = TUTORIAL_SLIDES[currentIndex];
  const IconComponent = slide.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guia de Uso - Dia 5">
      <div className="flex flex-col items-center text-center space-y-5 py-2">
        {/* Ícone grande */}
        <div className={`p-5 rounded-3xl border ${slide.colorClass}`}>
          <IconComponent className="w-12 h-12" />
        </div>

        {/* Passos e Título */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
            Passo {currentIndex + 1} de {TUTORIAL_SLIDES.length}
          </span>
          <h3 className="text-xl font-bold text-on-surface">{slide.title}</h3>
          <p className="text-xs font-semibold text-secondary">{slide.subtitle}</p>
        </div>

        {/* Descrição */}
        <p className="text-xs text-on-surface-variant leading-relaxed px-2">
          {slide.description}
        </p>

        {/* Indicadores de Progresso */}
        <div className="flex justify-center gap-1.5 pt-2">
          {TUTORIAL_SLIDES.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-outline'
              }`}
            />
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center w-full pt-4 border-t border-outline">
          {currentIndex > 0 ? (
            <button
              onClick={handlePrev}
              className="px-3 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors shadow-md flex items-center gap-1.5"
          >
            <span>{currentIndex === TUTORIAL_SLIDES.length - 1 ? 'Concluir!' : 'Próximo'}</span>
            {currentIndex === TUTORIAL_SLIDES.length - 1 ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
