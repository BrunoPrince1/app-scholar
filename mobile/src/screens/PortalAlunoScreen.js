import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, FlatList, ActivityIndicator,
  StyleSheet, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/global';
import { meuBoletim } from '../services/academicService';

export default function PortalAlunoScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [boletim,  setBoletim]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState('');

  useEffect(() => { carregarBoletim(); }, []);

  const carregarBoletim = async () => {
    setLoading(true);
    try {
      const dados = await meuBoletim();
      setBoletim(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const corMedia = (media) => {
    if (media >= 7) return '#2E7D32';
    if (media >= 6) return '#F57F17';
    return '#C62828';
  };

  const corSituacao = (s) => (s === 'Aprovado' ? '#2E7D32' : '#C62828');

  const handleLogout = () => { logout(); navigation.replace('Login'); };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Olá, {user?.nome?.split(' ')[0]}! 👋</Text>
          <Text style={styles.headerSub}>Portal do Aluno</Text>
        </View>
        <Text style={styles.headerIcon}>🎓</Text>
      </View>

      {/* Info do aluno */}
      {boletim && (
        <View style={styles.infoCard}>
          <Text style={styles.infoNome}>{boletim.aluno}</Text>
          <Text style={styles.infoSub}>Matrícula: {boletim.matricula}</Text>
          {boletim.curso ? <Text style={styles.infoSub}>{boletim.curso}</Text> : null}
        </View>
      )}

      {/* Boletim */}
      <Text style={styles.secTitle}>📊 Meu Boletim</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
      ) : erro ? (
        <View style={styles.erroBox}>
          <Text style={styles.erroText}>{erro}</Text>
          <TouchableOpacity onPress={carregarBoletim} style={styles.retryBtn}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : boletim?.disciplinas?.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Nenhuma nota lançada ainda.</Text>
        </View>
      ) : (
        boletim?.disciplinas?.map((d, i) => (
          <View key={i} style={styles.notaCard}>
            <Text style={styles.notaDisciplina}>{d.disciplina}</Text>
            <View style={styles.notasRow}>
              <View style={styles.notaBox}>
                <Text style={styles.notaLabel}>Nota 1</Text>
                <Text style={styles.notaValor}>{d.nota1?.toFixed(1)}</Text>
              </View>
              <View style={styles.notaBox}>
                <Text style={styles.notaLabel}>Nota 2</Text>
                <Text style={styles.notaValor}>{d.nota2?.toFixed(1)}</Text>
              </View>
              <View style={[styles.notaBox, { backgroundColor: '#F3F4F6' }]}>
                <Text style={styles.notaLabel}>Média</Text>
                <Text style={[styles.notaValor, { color: corMedia(d.media), fontWeight: 'bold' }]}>
                  {d.media?.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={[styles.situacaoBadge, { backgroundColor: corSituacao(d.situacao) }]}>
              <Text style={styles.situacaoText}>{d.situacao}</Text>
            </View>
          </View>
        ))
      )}

      {/* Ações */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AlterarSenha', { obrigatorio: false })}
        >
          <Text style={styles.actionIcon}>🔑</Text>
          <Text style={styles.actionLabel}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪  Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { padding: 16, paddingBottom: 32, backgroundColor: colors.background },
  header:          { backgroundColor: colors.primary, borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerGreeting:  { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub:       { fontSize: 13, color: '#90CAF9', marginTop: 2 },
  headerIcon:      { fontSize: 40 },
  infoCard:        { backgroundColor: '#E3F2FD', borderRadius: 12, padding: 16, marginBottom: 16 },
  infoNome:        { fontSize: 17, fontWeight: 'bold', color: colors.primary },
  infoSub:         { fontSize: 13, color: '#555', marginTop: 2 },
  secTitle:        { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  notaCard:        { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  notaDisciplina:  { fontSize: 15, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
  notasRow:        { flexDirection: 'row', gap: 8, marginBottom: 10 },
  notaBox:         { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 8, padding: 10, alignItems: 'center' },
  notaLabel:       { fontSize: 11, color: '#888', marginBottom: 2 },
  notaValor:       { fontSize: 20, color: '#333' },
  situacaoBadge:   { alignSelf: 'flex-start', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 14 },
  situacaoText:    { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  erroBox:         { alignItems: 'center', marginTop: 32 },
  erroText:        { color: colors.error, marginBottom: 12 },
  retryBtn:        { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20 },
  retryText:       { color: '#fff', fontWeight: 'bold' },
  emptyBox:        { alignItems: 'center', marginTop: 32 },
  emptyIcon:       { fontSize: 48, marginBottom: 8 },
  emptyText:       { color: '#888', fontSize: 15 },
  actionsSection:  { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 16 },
  actionCard:      { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  actionIcon:      { fontSize: 28, marginBottom: 6 },
  actionLabel:     { fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'center' },
  logoutBtn:       { backgroundColor: '#D32F2F', borderRadius: 12, padding: 15, alignItems: 'center' },
  logoutText:      { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
