import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles, colors } from '../styles/global';

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      setErro('Preencha todos os campos!');
      return;
    }
    setErro('');

    const resultado = await login(email, senha);

    if (resultado.sucesso) {
      navigation.replace('Dashboard');
    } else {
      setErro(resultado.erro || 'Credenciais inválidas.');
    }
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.title}>App Scholar</Text>
      <Text style={{ textAlign: 'center', color: colors.text, marginBottom: 24 }}>
        Sistema Acadêmico — Fatec
      </Text>

      <CustomInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="seu@email.com"
        keyboardType="email-address"
      />
      <CustomInput
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        placeholder="Digite sua senha"
        secureTextEntry
      />

      {erro ? (
        <Text style={{ color: colors.error, marginBottom: 10, textAlign: 'center' }}>
          {erro}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
      ) : (
        <CustomButton title="Entrar" onPress={handleLogin} />
      )}

      <Text style={{ textAlign: 'center', color: '#888', marginTop: 16, fontSize: 12 }}>
        Usuário padrão: admin@appschollar.com{'\n'}Senha: admin123
      </Text>
    </ScrollView>
  );
}
