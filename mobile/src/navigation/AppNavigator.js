import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth
import LoginScreen          from '../screens/LoginScreen';
import AlterarSenhaScreen   from '../screens/AlterarSenhaScreen';

// Admin
import DashboardScreen          from '../screens/DashboardScreen';
import CadastroAlunoScreen      from '../screens/CadastroAlunoScreen';
import CadastroProfessorScreen  from '../screens/CadastroProfessorScreen';
import CadastroDisciplinaScreen from '../screens/CadastroDisciplinaScreen';
import ListaAlunosScreen        from '../screens/ListaAlunosScreen';
import ListaProfessoresScreen   from '../screens/ListaProfessoresScreen';
import ListaDisciplinasScreen   from '../screens/ListaDisciplinasScreen';
import AlunosDisciplinaScreen   from '../screens/AlunosDisciplinaScreen';
import BoletimScreen            from '../screens/BoletimScreen';

// Portais
import PortalAlunoScreen      from '../screens/PortalAlunoScreen';
import PortalProfessorScreen  from '../screens/PortalProfessorScreen';

const Stack = createNativeStackNavigator();

const headerOpts = {
  headerStyle:      { backgroundColor: '#003087' },
  headerTintColor:  '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={headerOpts}>

      {/* ── Acesso ────────────────────────────────────────────────── */}
      <Stack.Screen name="Login"        component={LoginScreen}        options={{ headerShown: false }} />
      <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} options={{ title: 'Alterar Senha' }} />

      {/* ── Portais de perfil ─────────────────────────────────────── */}
      <Stack.Screen name="PortalAluno"     component={PortalAlunoScreen}     options={{ title: 'Portal do Aluno',     headerBackVisible: false }} />
      <Stack.Screen name="PortalProfessor" component={PortalProfessorScreen} options={{ title: 'Portal do Professor', headerBackVisible: false }} />

      {/* ── Admin: Dashboard ──────────────────────────────────────── */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'App Scholar', headerBackVisible: false }} />

      {/* ── Admin: Cadastros ──────────────────────────────────────── */}
      <Stack.Screen name="CadastroAluno"      component={CadastroAlunoScreen}      options={{ title: 'Novo Aluno' }} />
      <Stack.Screen name="CadastroProfessor"  component={CadastroProfessorScreen}  options={{ title: 'Novo Professor' }} />
      <Stack.Screen name="CadastroDisciplina" component={CadastroDisciplinaScreen} options={{ title: 'Nova Disciplina' }} />

      {/* ── Admin: Gerenciamento ──────────────────────────────────── */}
      <Stack.Screen name="ListaAlunos"        component={ListaAlunosScreen}        options={{ title: 'Gerenciar Alunos' }} />
      <Stack.Screen name="ListaProfessores"   component={ListaProfessoresScreen}   options={{ title: 'Gerenciar Professores' }} />
      <Stack.Screen name="ListaDisciplinas"   component={ListaDisciplinasScreen}   options={{ title: 'Gerenciar Disciplinas' }} />
      <Stack.Screen name="AlunosDisciplina"   component={AlunosDisciplinaScreen}   options={{ title: 'Alunos da Disciplina' }} />

      {/* ── Admin: Consultas ──────────────────────────────────────── */}
      <Stack.Screen name="Boletim" component={BoletimScreen} options={{ title: 'Boletim Acadêmico' }} />

    </Stack.Navigator>
  );
}
