import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/auth.service';
import { usersService, UserProfile } from '../services/users.service';
import { Mail, KeyRound, Link2, LogOut, X, HelpCircle, Moon, Sun, Camera, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export const AccountScreen = ({ navigation }: any) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState('');
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [shadowUserId, setShadowUserId] = useState('');
  const [codigoPerfilReal, setCodigoPerfilReal] = useState('');

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

  const handleSavePhoto = async () => {
    setError('');
    setActionLoading(true);
    try {
      const updated = await usersService.updateProfile({ fotoUrl: selectedPhotoUrl });
      setProfile(updated);
      setIsPhotoOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar foto de perfil.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.replace('Login');
  };

  const handleLinkShadowUser = async () => {
    setError('');
    setSuccess('');
    if (!shadowUserId || !codigoPerfilReal) {
      setError('Preencha o ID do convidado e o código de perfil real.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await usersService.linkShadowUser(shadowUserId, codigoPerfilReal);
      setSuccess(res.message);
      setShadowUserId('');
      setCodigoPerfilReal('');
      setTimeout(() => {
        setIsLinkOpen(false);
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao vincular perfil fantasma.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Minha Conta & Perfil</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Informações do usuário e Código de Perfil único.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
          {/* Card de Perfil */}
          <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.userRow}>
              <TouchableOpacity style={styles.avatarWrapper} onPress={() => { setSelectedPhotoUrl(profile?.fotoUrl || ''); setIsPhotoOpen(true); }}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  {profile?.fotoUrl ? (
                    <Image source={{ uri: profile.fotoUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {profile?.nome ? profile.nome.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  )}
                </View>
                <View style={[styles.cameraBadge, { backgroundColor: colors.secondary }]}>
                  <Camera size={12} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{profile?.nome}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Mail size={12} color={colors.textMuted} />
                  <Text style={[styles.userEmail, { color: colors.textMuted }]}>{profile?.email || 'Sem e-mail'}</Text>
                </View>
                <View style={[styles.verifiedTag, { backgroundColor: colors.secondaryBg }]}>
                  <Text style={[styles.verifiedText, { color: colors.secondary }]}>Conta Real Verificada</Text>
                </View>
              </View>
            </View>

            {/* Código de Perfil */}
            <View style={[styles.codeCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <KeyRound size={16} color={colors.primary} />
                <Text style={[styles.codeLabel, { color: colors.textMuted }]}>CÓDIGO DE PERFIL ÚNICO</Text>
              </View>
              <Text style={[styles.codeText, { color: colors.primary }]}>{profile?.codigoPerfil || 'N/A'}</Text>
              <Text style={[styles.codeSub, { color: colors.textMuted }]}>
                Forneça este código aos seus amigos para conecta-los ao seu perfil!
              </Text>
            </View>
          </View>

          {/* Opções de Ação */}
          <View style={[styles.actionList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Toggle Tema */}
            <View style={[styles.actionItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)' }]}>
                {isDark ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                  {isDark ? 'Modo Claro' : 'Modo Escuro'}
                </Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>
                  Atualmente: {isDark ? 'Tema Escuro' : 'Tema Claro'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={isDark ? colors.primary : colors.textMuted}
              />
            </View>

            {/* Ver Tutorial */}
            <TouchableOpacity
              style={[styles.actionItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('Onboarding', { isReplay: true })}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.secondaryBg }]}>
                <HelpCircle size={20} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Ver Tutorial de Uso</Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>Aprenda passo a passo como funciona o aplicativo.</Text>
              </View>
            </TouchableOpacity>

            {/* Vincular Perfil Fantasma */}
            <TouchableOpacity
              style={[styles.actionItem, { borderBottomColor: colors.border }]}
              onPress={() => setIsLinkOpen(true)}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primaryBg }]}>
                <Link2 size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Vincular Perfil Fantasma (Shadow User)</Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>Transfira o histórico de quem não tem o app.</Text>
              </View>
            </TouchableOpacity>

            {/* Encerrar Sessão */}
            <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
              <View style={[styles.actionIcon, { backgroundColor: colors.dangerBg }]}>
                <LogOut size={20} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.logoutTitle, { color: colors.danger }]}>Encerrar Sessão</Text>
                <Text style={[styles.logoutSub, { color: colors.danger + 'aa' }]}>Fazer logout deste celular.</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Modal Vincular Perfil Fantasma */}
      <Modal visible={isLinkOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Vincular Perfil Fantasma</Text>
              <TouchableOpacity onPress={() => setIsLinkOpen(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={[styles.modalError, { color: colors.danger }]}>{error}</Text>}
            {!!success && <Text style={[styles.modalSuccess, { color: colors.secondary }]}>{success}</Text>}

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>ID DO CONVIDADO (SHADOW USER)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="UUID do perfil fantasma"
              placeholderTextColor={colors.textMuted}
              value={shadowUserId}
              onChangeText={setShadowUserId}
            />

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>CÓDIGO DE PERFIL REAL (6 DÍGITOS)</Text>
            <TextInput
              style={[styles.modalInput, styles.codeInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.primary }]}
              placeholder="Ex: MUR998"
              placeholderTextColor={colors.textMuted}
              maxLength={6}
              autoCapitalize="characters"
              value={codigoPerfilReal}
              onChangeText={(val) => setCodigoPerfilReal(val.toUpperCase())}
            />

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleLinkShadowUser}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.modalButtonText}>Vincular e Migrar Histórico</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Foto de Perfil */}
      <Modal visible={isPhotoOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Escolher Foto de Perfil</Text>
              <TouchableOpacity onPress={() => setIsPhotoOpen(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={[styles.modalError, { color: colors.danger }]}>{error}</Text>}

            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>SELECIONE UM AVATAR DA COLEÇÃO</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
              {[
                'https://api.dicebear.com/7.x/avataaars/png?seed=Felix',
                'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka',
                'https://api.dicebear.com/7.x/bottts/png?seed=Alex',
                'https://api.dicebear.com/7.x/micah/png?seed=Sara',
                'https://api.dicebear.com/7.x/personas/png?seed=Diego',
                'https://api.dicebear.com/7.x/big-smile/png?seed=Leo',
              ].map((url) => (
                <TouchableOpacity
                  key={url}
                  style={[
                    styles.presetAvatar,
                    { borderColor: selectedPhotoUrl === url ? colors.primary : colors.border },
                    selectedPhotoUrl === url && { borderWidth: 3 },
                  ]}
                  onPress={() => setSelectedPhotoUrl(url)}
                >
                  <Image source={{ uri: url }} style={styles.presetImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { color: colors.textMuted, marginTop: 8 }]}>OU INSIRA O LINK DA SUA FOTO (URL)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="https://suafoto.com/imagem.png"
              placeholderTextColor={colors.textMuted}
              value={selectedPhotoUrl}
              onChangeText={setSelectedPhotoUrl}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleSavePhoto}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Check size={18} color="#ffffff" />
                  <Text style={styles.modalButtonText}>Salvar Foto de Perfil</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 12 },
  content: { padding: 16, gap: 16 },
  profileCard: { borderRadius: 24, padding: 20, borderWidth: 1, gap: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 24 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 12 },
  verifiedTag: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, alignSelf: 'flex-start', marginTop: 6,
  },
  verifiedText: { fontWeight: 'bold', fontSize: 10 },
  codeCard: { borderRadius: 16, padding: 14, borderWidth: 1, gap: 6 },
  codeLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  codeText: { fontSize: 26, fontWeight: 'bold', letterSpacing: 3 },
  codeSub: { fontSize: 11 },
  actionList: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  actionItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12, borderBottomWidth: 1,
  },
  actionIcon: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  actionTitle: { fontSize: 14, fontWeight: 'bold' },
  actionSub: { fontSize: 12, marginTop: 2 },
  logoutItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  logoutTitle: { fontSize: 14, fontWeight: 'bold' },
  logoutSub: { fontSize: 12, marginTop: 2 },
  avatarWrapper: { position: 'relative' },
  avatarImage: { width: 56, height: 56, borderRadius: 22 },
  cameraBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#ffffff',
  },
  presetAvatar: { width: 54, height: 54, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  presetImage: { width: '100%', height: '100%' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalError: { fontSize: 13 },
  modalSuccess: { fontSize: 13, fontWeight: 'bold' },
  inputLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  modalInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, height: 50, fontSize: 15 },
  codeInput: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', letterSpacing: 4 },
  modalButton: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  modalButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});
