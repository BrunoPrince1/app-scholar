import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles, colors } from '../styles/global';

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [erro,  setErro]    = useState('');

  const handleLogin = async () => {
    if (!email || !senha) { setErro('Preencha todos os campos!'); return; }
    setErro('');
    const resultado = await login(email, senha);

    if (!resultado.sucesso) { setErro(resultado.erro || 'Credenciais inválidas.'); return; }

    // Se ainda está com a senha padrão, força troca antes de continuar
    if (resultado.senhaPadrao) {
      navigation.replace('AlterarSenha', { obrigatorio: true });
      return;
    }

    // Redireciona conforme perfil
    const dest = {
      admin:     'Dashboard',
      professor: 'PortalProfessor',
      aluno:     'PortalAluno',
    }[resultado.perfil] || 'Dashboard';

    navigation.replace(dest);
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>🎓</Text>
        <Text style={styles.title}>App Scholar</Text>
        <Text style={styles.subtitle}>Sistema Acadêmico — Fatec</Text>
      </View>

      <CustomInput label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
      <CustomInput label="Senha" value={senha} onChangeText={setSenha} placeholder="Digite sua senha" secureTextEntry />

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      {loading
        ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        : <CustomButton title="Entrar" onPress={handleLogin} />}

      <Text style={styles.hint}>
        Admin: admin@appschollar.com / admin123{'\n'}
        Alunos e professores: senha padrão 123456
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logoBox: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  logoText: { fontSize: 56 },
  title:    { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginTop: 8 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  erro:     { color: colors.error, textAlign: 'center', marginBottom: 10 },
  hint:     { textAlign: 'center', color: '#aaa', marginTop: 20, fontSize: 12, lineHeight: 20 },
});
