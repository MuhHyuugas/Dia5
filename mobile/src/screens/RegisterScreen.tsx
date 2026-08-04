import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/auth.service';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const RegisterScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!nome || !email || !senha) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({ nome, email, senha });
      navigation.replace('MainTabs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={[styles.logoBadge, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]}>
            <Text style={styles.logoText}>D5</Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Criar Conta</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Cadastre-se para controlar seus gastos em grupo.</Text>
        </View>

        {!!error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.dangerBg, borderColor: colors.danger + '50' }]}>
            <AlertCircle size={18} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        <View style={{ gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Text style={[styles.label, { color: colors.textMuted }]}>NOME COMPLETO</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <User size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Seu nome"
                placeholderTextColor={colors.textMuted}
                value={nome}
                onChangeText={setNome}
              />
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={[styles.label, { color: colors.textMuted }]}>E-MAIL</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Mail size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={[styles.label, { color: colors.textMuted }]}>SENHA</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Lock size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary }, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <>
                <Text style={[styles.buttonText, { color: colors.textInverse }]}>Cadastrar</Text>
                <UserPlus size={18} color={colors.textInverse} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.linkText, { color: colors.textMuted }]}>
              Já possui uma conta? <Text style={[styles.linkHighlight, { color: colors.secondary }]}>Fazer Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  button: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
  },
  linkHighlight: {
    fontWeight: 'bold',
  },
});
