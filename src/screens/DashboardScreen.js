import React, { useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import { globalStyles, colors } from '../styles/global';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log('✅ Dashboard carregado com useEffect');
  }, []);

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.title}>Bem-vindo, {user?.nome}!</Text>
      
      <View style={globalStyles.card}>
        <CustomButton title="Cadastro de Alunos" onPress={() => navigation.navigate('CadastroAluno')} color={colors.secondary} />
        <CustomButton title="Cadastro de Professores" onPress={() => navigation.navigate('CadastroProfessor')} color={colors.secondary} />
        <CustomButton title="Cadastro de Disciplinas" onPress={() => navigation.navigate('CadastroDisciplina')} color={colors.secondary} />
        <CustomButton title="Visualizar Boletim" onPress={() => navigation.navigate('Boletim')} />
      </View>

      <CustomButton title="Sair" onPress={handleLogout} color="#D32F2F" />
    </ScrollView>
  );
}