import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CadastroAlunoScreen from '../screens/CadastroAlunoScreen';
import CadastroProfessorScreen from '../screens/CadastroProfessorScreen';
import CadastroDisciplinaScreen from '../screens/CadastroDisciplinaScreen';
import BoletimScreen from '../screens/BoletimScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerStyle: { backgroundColor: '#003087' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login - App Scholar' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="CadastroAluno" component={CadastroAlunoScreen} options={{ title: 'Cadastro de Alunos' }} />
      <Stack.Screen name="CadastroProfessor" component={CadastroProfessorScreen} options={{ title: 'Cadastro de Professores' }} />
      <Stack.Screen name="CadastroDisciplina" component={CadastroDisciplinaScreen} options={{ title: 'Cadastro de Disciplinas' }} />
      <Stack.Screen name="Boletim" component={BoletimScreen} options={{ title: 'Visualizar Boletim' }} />
    </Stack.Navigator>
  );
}