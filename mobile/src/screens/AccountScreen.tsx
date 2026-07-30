import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { authService } from '../services/auth.service';
import { usersService, UserProfile } from '../services/users.service';
import { Mail, KeyRound, Link2, LogOut, X, HelpCircle } from 'lucide-react-native';

export const AccountScreen = ({ navigation }: any) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Vincular Perfil Fantasma
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minha Conta & Perfil</Text>
        <Text style={styles.subtitle}>Informações do usuário e Código de Perfil único.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 32 }} />
      ) : (
        <View style={styles.content}>
          {/* Card de Perfil */}
          <View style={styles.profileCard}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.nome ? profile.nome.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{profile?.nome}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Mail size={12} color="#94a3b8" />
                  <Text style={styles.userEmail}>{profile?.email || 'Sem e-mail'}</Text>
                </View>
                <View style={styles.verifiedTag}>
                  <Text style={styles.verifiedText}>Conta Real Verificada</Text>
                </View>
              </View>
            </View>

            {/* Código de Perfil Único */}
            <View style={styles.codeCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <KeyRound size={16} color="#7c3aed" />
                <Text style={styles.codeLabel}>CÓDIGO DE PERFIL ÚNICO</Text>
              </View>
              <Text style={styles.codeText}>{profile?.codigoPerfil || 'N/A'}</Text>
              <Text style={styles.codeSub}>
                Forneça este código aos seus amigos para conecta-los ao seu perfil!
              </Text>
            </View>
          </View>

          {/* Opções de Ação */}
          <View style={styles.actionList}>
            {/* Ver Tutorial de Uso */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Onboarding', { isReplay: true })}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <HelpCircle size={20} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Ver Tutorial de Uso</Text>
                <Text style={styles.actionSub}>Aprenda passo a passo como funciona o aplicativo.</Text>
              </View>
            </TouchableOpacity>

            {/* Vincular Perfil Fantasma */}
            <TouchableOpacity style={styles.actionItem} onPress={() => setIsLinkOpen(true)}>
              <View style={styles.actionIcon}>
                <Link2 size={20} color="#7c3aed" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Vincular Perfil Fantasma (Shadow User)</Text>
                <Text style={styles.actionSub}>Transfira o histórico de quem não tem o app.</Text>
              </View>
            </TouchableOpacity>

            {/* Encerrar Sessão */}
            <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <LogOut size={20} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.logoutTitle}>Encerrar Sessão</Text>
                <Text style={styles.logoutSub}>Fazer logout deste celular.</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal Vincular Perfil Fantasma */}
      <Modal visible={isLinkOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vincular Perfil Fantasma</Text>
              <TouchableOpacity onPress={() => setIsLinkOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={styles.modalError}>{error}</Text>}
            {!!success && <Text style={styles.modalSuccess}>{success}</Text>}

            <Text style={styles.inputLabel}>ID DO CONVIDADO (SHADOW USER)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="UUID do perfil fantasma"
              placeholderTextColor="#94a3b8"
              value={shadowUserId}
              onChangeText={setShadowUserId}
            />

            <Text style={styles.inputLabel}>CÓDIGO DE PERFIL REAL (6 DÍGITOS)</Text>
            <TextInput
              style={[styles.modalInput, styles.codeInput]}
              placeholder="Ex: MUR998"
              placeholderTextColor="#94a3b8"
              maxLength={6}
              autoCapitalize="characters"
              value={codigoPerfilReal}
              onChangeText={(val) => setCodigoPerfilReal(val.toUpperCase())}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleLinkShadowUser}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.modalButtonText}>Transferir Histórico</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1326',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#171f33',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#171f33',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2d3449',
    gap: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 22,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  userEmail: {
    fontSize: 12,
    color: '#94a3b8',
  },
  verifiedTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  verifiedText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 10,
  },
  codeCard: {
    backgroundColor: '#0b1326',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d3449',
    gap: 6,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  codeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#7c3aed',
    letterSpacing: 3,
  },
  codeSub: {
    fontSize: 11,
    color: '#94a3b8',
  },
  actionList: {
    backgroundColor: '#171f33',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2d3449',
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3449',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  actionSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  logoutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  logoutSub: {
    fontSize: 12,
    color: 'rgba(239, 68, 68, 0.7)',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#171f33',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#2d3449',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dae2fd',
  },
  modalError: {
    color: '#ef4444',
    fontSize: 13,
  },
  modalSuccess: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  modalInput: {
    backgroundColor: '#0b1326',
    borderWidth: 1,
    borderColor: '#2d3449',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    color: '#dae2fd',
    fontSize: 15,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    letterSpacing: 4,
  },
  modalButton: {
    backgroundColor: '#7c3aed',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
