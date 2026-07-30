import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
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

const { width } = Dimensions.get('window');

const TUTORIAL_SLIDES = [
  {
    id: '1',
    icon: Users,
    iconColor: '#7c3aed',
    badgeColor: 'rgba(124, 58, 237, 0.15)',
    title: 'Bem-vindo ao Dia 5! 👋',
    subtitle: 'Divisão de Contas sem Estresse',
    description:
      'O Dia 5 foi feito para você gerenciar despesas compartilhadas com amigos, repúblicas, viagens e festas de forma simples e transparente.',
  },
  {
    id: '2',
    icon: Users,
    iconColor: '#10b981',
    badgeColor: 'rgba(16, 185, 129, 0.15)',
    title: 'Criar ou Entrar em Grupos 🏠',
    subtitle: 'Código de Convite de 6 Dígitos',
    description:
      'Crie grupos para cada ocasião (ex: "Casa") ou entre no grupo do seu amigo usando o Código de Convite (ex: REP456).',
  },
  {
    id: '3',
    icon: PlusCircle,
    iconColor: '#3b82f6',
    badgeColor: 'rgba(59, 130, 246, 0.15)',
    title: 'Divisão Inteligente de Contas 💸',
    subtitle: 'Divisão Igualitária ou Cotas',
    description:
      'Lance despesas e escolha entre divisão igualitária com 1 toque ou cotas personalizadas. O sistema valida se as partes somam o valor total pago!',
  },
  {
    id: '4',
    icon: UserPlus,
    iconColor: '#f59e0b',
    badgeColor: 'rgba(245, 158, 11, 0.15)',
    title: 'Convidados sem App (Shadow Users) 👤',
    subtitle: 'Ninguém Fica de Fora',
    description:
      'Adicione participantes sem o aplicativo instalado como Convidados. Quando a pessoa criar uma conta real, vincule o histórico e transfira o saldo!',
  },
  {
    id: '5',
    icon: Wallet,
    iconColor: '#ec4899',
    badgeColor: 'rgba(236, 72, 153, 0.15)',
    title: 'Conecte Amigos & Acerto de Contas 🤝',
    subtitle: 'Balanço Global & Liquidação',
    description:
      'Compartilhe seu Código de Perfil único, veja o saldo consolidado entre todos os grupos e registre liquidações de dívida em 1 clique.',
  },
];

export const OnboardingScreen = ({ navigation, route }: any) => {
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão Pular / Fechar */}
      <View style={styles.topBar}>
        {currentIndex > 0 ? (
          <TouchableOpacity style={styles.navIconBtn} onPress={handlePrev}>
            <ChevronLeft size={20} color="#dae2fd" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <TouchableOpacity onPress={finishTutorial}>
          <Text style={styles.skipText}>{isReplay ? 'Fechar' : 'Pular Tutorial'}</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo do Slide */}
      <View style={styles.slideContainer}>
        <View style={[styles.iconBadge, { backgroundColor: slide.badgeColor }]}>
          <IconComponent size={56} color={slide.iconColor} />
        </View>

        <Text style={styles.stepTag}>PASSO {currentIndex + 1} DE {TUTORIAL_SLIDES.length}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      {/* Indicadores de Progresso em Pontos */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {TUTORIAL_SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Botão Avançar / Concluir */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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
    backgroundColor: '#0b1326',
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
    backgroundColor: '#171f33',
    borderRadius: 12,
  },
  skipText: {
    color: '#94a3b8',
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
    color: '#7c3aed',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dae2fd',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
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
  activeDot: {
    width: 28,
    backgroundColor: '#7c3aed',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#2d3449',
  },
  nextButton: {
    backgroundColor: '#7c3aed',
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#7c3aed',
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
