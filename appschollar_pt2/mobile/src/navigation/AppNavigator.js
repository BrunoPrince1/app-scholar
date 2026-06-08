import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';

// Cadastro
import CadastroAlunoScreen from '../screens/CadastroAlunoScreen';
import CadastroProfessorScreen from '../screens/CadastroProfessorScreen';
import CadastroDisciplinaScreen from '../screens/CadastroDisciplinaScreen';

// Listagem / Gerenciamento
import ListaAlunosScreen from '../screens/ListaAlunosScreen';
import ListaProfessoresScreen from '../screens/ListaProfessoresScreen';
import ListaDisciplinasScreen from '../screens/ListaDisciplinasScreen';

// Boletim
import BoletimScreen from '../screens/BoletimScreen';

const Stack = createNativeStackNavigator();

const headerOpts = {
  headerStyle: { backgroundColor: '#003087' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={headerOpts}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'App Scholar', headerShown: false }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'App Scholar', headerBackVisible: false }}
      />

      {/* ── Cadastro ─────────────────────────────────────── */}
      <Stack.Screen
        name="CadastroAluno"
        component={CadastroAlunoScreen}
        options={{ title: 'Novo Aluno' }}
      />
      <Stack.Screen
        name="CadastroProfessor"
        component={CadastroProfessorScreen}
        options={{ title: 'Novo Professor' }}
      />
      <Stack.Screen
        name="CadastroDisciplina"
        component={CadastroDisciplinaScreen}
        options={{ title: 'Nova Disciplina' }}
      />

      {/* ── Listagem / Gerenciamento ──────────────────────── */}
      <Stack.Screen
        name="ListaAlunos"
        component={ListaAlunosScreen}
        options={{ title: 'Gerenciar Alunos' }}
      />
      <Stack.Screen
        name="ListaProfessores"
        component={ListaProfessoresScreen}
        options={{ title: 'Gerenciar Professores' }}
      />
      <Stack.Screen
        name="ListaDisciplinas"
        component={ListaDisciplinasScreen}
        options={{ title: 'Gerenciar Disciplinas' }}
      />

      {/* ── Consultas ────────────────────────────────────── */}
      <Stack.Screen
        name="Boletim"
        component={BoletimScreen}
        options={{ title: 'Boletim Acadêmico' }}
      />
    </Stack.Navigator>
  );
}
