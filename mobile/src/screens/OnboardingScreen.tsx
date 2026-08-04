import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Users,
  PlusCircle,
  UserPlus,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

const TUTORIAL_SLIDES = [
  {
    id: '1',
    icon: Users,
    title: 'Bem-vindo ao Dia 5! 👋',
    subtitle: 'Divisão de Contas sem Estresse',
    description:
      'O Dia 5 foi feito para você gerenciar despesas compartilhadas com amigos, repúblicas, viagens e festas de forma simples e transparente.',
    accentKey: 'primary' as const,
  },
  {
    id: '2',
    icon: Users,
    title: 'Criar ou Entrar em Grupos 🏠',
    subtitle: 'Código de Convite de 6 Dígitos',
    description:
      'Crie grupos para cada ocasião (ex: "Casa") ou entre no grupo do seu amigo usando o Código de Convite (ex: REP456).',
    accentKey: 'secondary' as const,
  },
  {
    id: '3',
    icon: PlusCircle,
    title: 'Divisão Inteligente de Contas 💸',
    subtitle: 'Divisão Igualitária ou Cotas',
    description:
      'Lance despesas e escolha entre divisão igualitária com 1 toque ou cotas personalizadas. O sistema valida se as partes somam o valor total pago!',
    accentKey: 'blue' as const,
  },
  {
    id: '4',
    icon: UserPlus,
    title: 'Convidados sem App (Shadow Users) 👤',
    subtitle: 'Ninguém Fica de Fora',
    description:
      'Adicione participantes sem o aplicativo instalado como Convidados. Quando a pessoa criar uma conta real, vincule o histórico e transfira o saldo!',
    accentKey: 'amber' as const,
  },
  {
    id: '5',
    icon: Wallet,
    title: 'Conecte Amigos & Acerto de Contas 🤝',
    subtitle: 'Balanço Global & Liquidação',
    description:
      'Compartilhe seu Código de Perfil único, veja o saldo consolidado entre todos os grupos e registre liquidações de dívida em 1 clique.',
    accentKey: 'pink' as const,
  },
];

const ACCENT_COLORS: Record<string, { icon: string; bg: string; }> = {
  primary: { icon: '#7c3aed', bg: 'rgba(124, 58, 237, 0.15)' },
  secondary: { icon: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  blue: { icon: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  amber: { icon: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  pink: { icon: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
};

export const OnboardingScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const isReplay = route.params?.isReplay || false;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < TUTORIAL_SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await finishTutorial();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const finishTutorial = async () => {
    await AsyncStorage.setItem('@dia5_has_seen_tutorial', 'true');
    if (isReplay) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  const slide = TUTORIAL_SLIDES[currentIndex];
  const IconComponent = slide.icon;
  const accent = ACCENT_COLORS[slide.accentKey];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {currentIndex > 0 ? (
          <TouchableOpacity
            style={[styles.navIconBtn, { backgroundColor: colors.surface }]}
            onPress={handlePrev}
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <TouchableOpacity onPress={finishTutorial}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>{isReplay ? 'Fechar' : 'Pular Tutorial'}</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Content */}
      <View style={styles.slideContainer}>
        <View style={[styles.iconBadge, { backgroundColor: accent.bg }]}>
          <IconComponent size={56} color={accent.icon} />
        </View>

        <Text style={[styles.stepTag, { color: colors.primary }]}>
          PASSO {currentIndex + 1} DE {TUTORIAL_SLIDES.length}
        </Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>{slide.subtitle}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{slide.description}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {TUTORIAL_SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex
                  ? { width: 28, backgroundColor: colors.primary }
                  : { width: 8, backgroundColor: colors.border },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={handleNext}
        >
          {currentIndex === TUTORIAL_SLIDES.length - 1 ? (
            <>
              <Text style={styles.nextButtonText}>Começar a Usar!</Text>
              <CheckCircle2 size={20} color="#ffffff" />
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>Próximo</Text>
              <ArrowRight size={20} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navIconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconBadge: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepTag: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
