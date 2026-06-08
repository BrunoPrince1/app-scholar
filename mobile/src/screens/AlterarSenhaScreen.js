import React, { useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, StyleSheet, Alert, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import CustomInput  from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles, colors } from '../styles/global';
import { alterarSenhaApi } from '../services/authService';

export default function AlterarSenhaScreen({ navigation, route }) {
  const { user, logout } = useAuth();
  const obrigatorio = route?.params?.obrigatorio ?? false;

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha,  setNovaSenha]  = useState('');
  const [confirmar,  setConfirmar]  = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmar) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    if (novaSenha !== confirmar) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha === '123456') {
      Alert.alert('Erro', 'Escolha uma senha diferente da senha padrão.');
      return;
    }

    setLoading(true);
    try {
      await alterarSenhaApi(senhaAtual, novaSenha);
      Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            if (obrigatorio) {
              // Redireciona para o portal correto após trocar a senha
              const dest = { admin: 'Dashboard', professor: 'PortalProfessor', aluno: 'PortalAluno' }[user?.perfil] || 'Dashboard';
              navigation.replace(dest);
            } else {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[globalStyles.container, { paddingTop: 24 }]}>
      {obrigatorio && (
        <View style={styles.avisoBox}>
          <Text style={styles.avisoIcon}>🔐</Text>
          <Text style={styles.avisoTitulo}>Troca de senha obrigatória</Text>
          <Text style={styles.avisoTexto}>
            Você está usando a senha padrão. Por segurança, crie uma nova senha antes de continuar.
          </Text>
        </View>
      )}

      <Text style={styles.saudacao}>Olá, {user?.nome?.split(' ')[0]}!</Text>

      <CustomInput label="Senha atual" value={senhaAtual} onChangeText={setSenhaAtual} secureTextEntry placeholder={obrigatorio ? '123456' : 'Senha atual'} />
      <CustomInput label="Nova senha" value={novaSenha} onChangeText={setNovaSenha} secureTextEntry placeholder="Mínimo 6 caracteres" />
      <CustomInput label="Confirmar nova senha" value={confirmar} onChangeText={setConfirmar} secureTextEntry placeholder="Repita a nova senha" />

      {loading
        ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        : <CustomButton title="Salvar nova senha" onPress={handleAlterarSenha} />}

      {!obrigatorio && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelar}>
          <Text style={styles.cancelarText}>Cancelar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avisoBox:    { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 16, marginBottom: 24, alignItems: 'center' },
  avisoIcon:   { fontSize: 36, marginBottom: 8 },
  avisoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#E65100', marginBottom: 4 },
  avisoTexto:  { fontSize: 13, color: '#BF360C', textAlign: 'center', lineHeight: 20 },
  saudacao:    { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 20 },
  cancelar:    { marginTop: 16, alignItems: 'center' },
  cancelarText:{ color: '#888', fontSize: 15 },
});
