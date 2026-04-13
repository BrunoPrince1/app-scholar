import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles, colors } from '../styles/global';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = () => {
    if (!email || !senha) {
      setErro('Preencha todos os campos!');
      return;
    }
    setErro('');
    // Login simulado
    login({ nome: 'João Silva', email });
    navigation.replace('Dashboard');
    Alert.alert('Sucesso', 'Login realizado com sucesso!');
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.title}>App Scholar</Text>
      <CustomInput label="E-mail ou Login" value={email} onChangeText={setEmail} placeholder="Digite seu e-mail" />
      <CustomInput label="Senha" value={senha} onChangeText={setSenha} placeholder="Digite sua senha" secureTextEntry />
      
      {erro ? <Text style={{ color: colors.error, marginBottom: 10 }}>{erro}</Text> : null}
      
      <CustomButton title="Entrar" onPress={handleLogin} />
    </ScrollView>
  );
}