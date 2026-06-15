import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { globalStyles, colors } from '../styles/global';

function MenuCard({ title, items }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.tile, { backgroundColor: item.color || colors.primary }]}
            onPress={item.onPress}
            activeOpacity={0.82}
          >
            <Text style={styles.tileIcon}>{item.icon}</Text>
            <Text style={styles.tileLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log('✅ Dashboard — usuário:', user?.nome);
  }, []);

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Olá, {user?.nome?.split(' ')[0]}! 👋</Text>
        <Text style={styles.subtitle}>
          {user?.perfil ? user.perfil.charAt(0).toUpperCase() + user.perfil.slice(1) : 'Usuário'}{' '}
          • {user?.email}
        </Text>
      </View>

      {/* Cadastrar novos registros */}
      <MenuCard
        title="➕  Cadastrar"
        items={[
          {
            icon: '👩‍🎓',
            label: 'Novo Aluno',
            color: '#1565C0',
            onPress: () => navigation.navigate('CadastroAluno'),
          },
          {
            icon: '👨‍🏫',
            label: 'Novo Professor',
            color: '#2E7D32',
            onPress: () => navigation.navigate('CadastroProfessor'),
          },
          {
            icon: '📚',
            label: 'Nova Disciplina',
            color: '#6A1B9A',
            onPress: () => navigation.navigate('CadastroDisciplina'),
          },
        ]}
      />

      {/* Gerenciar registros existentes */}
      <MenuCard
        title="📋  Gerenciar"
        items={[
          {
            icon: '🗂️',
            label: 'Alunos',
            color: '#0277BD',
            onPress: () => navigation.navigate('ListaAlunos'),
          },
          {
            icon: '👥',
            label: 'Professores',
            color: '#00695C',
            onPress: () => navigation.navigate('ListaProfessores'),
          },
          {
            icon: '🗃️',
            label: 'Disciplinas',
            color: '#4527A0',
            onPress: () => navigation.navigate('ListaDisciplinas'),
          },
        ]}
      />

      {/* Consultas */}
      <MenuCard
        title="📊  Consultas"
        items={[
          {
            icon: '📋',
            label: 'Boletim',
            color: '#E65100',
            onPress: () => navigation.navigate('Boletim'),
          },
        ]}
      />

      {/* Sair */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>🚪  Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#90CAF9',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '30%',
    flexGrow: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  tileIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  tileLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoutBtn: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
