import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Hook de layout responsivo.
 * Fornece helpers para adaptar espaçamentos, fontes e comportamentos
 * a diferentes tamanhos de tela (iPhone, iPhone Plus/Pro Max, iPad).
 */
export const useLayout = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  /** iPad e tablets Android (>= 768px de largura) */
  const isTablet = width >= 768;

  /** iPhone Plus / Pro Max e equivalentes Android (>= 414px) */
  const isLargePhone = width >= 414 && !isTablet;

  /**
   * Escala um valor de espaçamento proporcionalmente ao tamanho da tela.
   * Base desenhada para iPhone padrão (375px).
   */
  const spacing = (base: number): number => {
    const scale = width / 375;
    const scaled = base * Math.min(scale, isTablet ? 1.4 : 1.15);
    return Math.round(scaled);
  };

  /**
   * Escala tamanho de fonte proporcionalmente.
   * Ligeiramente mais conservador que spacing para manter legibilidade.
   */
  const fontSize = (base: number): number => {
    const scale = width / 375;
    const scaled = base * Math.min(scale, isTablet ? 1.2 : 1.08);
    return Math.round(scaled);
  };

  /**
   * Largura máxima de conteúdo (para tablet não esticar demais).
   * Em telefones retorna undefined (full width).
   */
  const maxContentWidth = isTablet ? Math.min(width * 0.75, 680) : undefined;

  return {
    width,
    height,
    insets,
    isTablet,
    isLargePhone,
    spacing,
    fontSize,
    maxContentWidth,
  };
};
