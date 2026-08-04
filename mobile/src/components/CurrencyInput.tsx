import React from 'react';
import {
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface CurrencyInputProps {
  /** Valor em centavos (inteiro). Ex: 1250 = R$ 12,50 */
  valueCents: number;
  onChangeCents: (cents: number) => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  placeholder?: string;
  placeholderTextColor?: string;
}

/**
 * Input no estilo bancário brasileiro.
 * O usuário digita apenas números e o valor se formata automaticamente
 * empurrando os dígitos da direita para a esquerda.
 * Ex: digitar "1", "2", "5", "0" → "0,01" → "0,12" → "1,25" → "12,50"
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  valueCents,
  onChangeCents,
  style,
  inputStyle,
  placeholder,
  placeholderTextColor,
}) => {
  /**
   * Formata centavos para o padrão "1.234,56"
   */
  const formatCents = (cents: number): string => {
    if (cents === 0) return '';
    const str = String(cents).padStart(3, '0');
    const intPart = str.slice(0, -2).replace(/^0+/, '') || '0';
    const decPart = str.slice(-2);
    // Adiciona separador de milhar
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${intFormatted},${decPart}`;
  };

  const handleChangeText = (text: string) => {
    // Extrai apenas dígitos do que o usuário digitou
    const digits = text.replace(/\D/g, '');
    // Limita a 9 dígitos (R$ 9.999.999,99)
    const trimmed = digits.slice(0, 9);
    const newCents = trimmed === '' ? 0 : parseInt(trimmed, 10);
    onChangeCents(newCents);
  };

  const displayValue = formatCents(valueCents);

  return (
    <TextInput
      style={[styles.input, inputStyle, style]}
      value={displayValue}
      onChangeText={handleChangeText}
      keyboardType="numeric"
      placeholder={placeholder ?? '0,00'}
      placeholderTextColor={placeholderTextColor}
      caretHidden={false}
      contextMenuHidden
    />
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});


