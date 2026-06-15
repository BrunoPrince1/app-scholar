import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, FlatList, ActivityIndicator,
  StyleSheet, TouchableOpacity, TextInput, Alert, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/global';
import {
  disciplinasDoProfessor, alunosDaDisciplina, lancarNota,
} from '../services/academicService';

export default function PortalProfessorScreen({ navigation }) {
  const { user, logout } = useAuth();

  const [disciplinas,    setDisciplinas]    = useState([]);
  const [loadingDisc,    setLoadingDisc]    = useState(true);
  const [discSelecionada, setDiscSelecionada] = useState(null);

  // Modal de notas
  const [alunos,      setAlunos]      = useState([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [modalVisivel,  setModalVisivel]  = useState(false);

  // Edição inline de nota
  const [notaEditando, setNotaEditando] = useState(null); // { alunoId, nota1, nota2 }
  const [salvando,     setSalvando]     = useState(false);

  useFocusEffect(useCallback(() => { carregarDisciplinas(); }, []));

  const carregarDisciplinas = async () => {
    setLoadingDisc(true);
    try {
      const dados = await disciplinasDoProfessor();
      setDisciplinas(dados);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoadingDisc(false);
    }
  };

  const abrirDisciplina = async (disc) => {
    setDiscSelecionada(disc);
    setNotaEditando(null);
    setModalVisivel(true);
    setLoadingAlunos(true);
    try {
      const dados = await alunosDaDisciplina(disc.id);
      setAlunos(dados);
    } catch (err) {
      Alert.alert('Erro', err.message);
      setModalVisivel(false);
    } finally {
      setLoadingAlunos(false);
    }
  };

  const iniciarEdicao = (aluno) => {
    setNotaEditando({
      alunoId:  aluno.aluno_id,
      nota1:    aluno.nota1?.toString() || '',
      nota2:    aluno.nota2?.toString() || '',
    });
  };

  const salvarNota = async () => {
    if (!notaEditando) return;
    const n1 = parseFloat(notaEditando.nota1);
    const n2 = parseFloat(notaEditando.nota2);
    if (isNaN(n1) || isNaN(n2) || n1 < 0 || n1 > 10 || n2 < 0 || n2 > 10) {
      Alert.alert('Erro', 'Notas devem ser números entre 0 e 10.');
      return;
    }
    setSalvando(true);
    try {
      await lancarNota({
        aluno_id:      notaEditando.alunoId,
        disciplina_id: discSelecionada.id,
        nota1:         n1,
        nota2:         n2,
      });
      // Recarrega lista
      const dados = await alunosDaDisciplina(discSelecionada.id);
      setAlunos(dados);
      setNotaEditando(null);
      Alert.alert('Sucesso', 'Nota salva!');
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleLogout = () => { logout(); navigation.replace('Login'); };

  const corMedia = (m) => { if (m >= 7) return '#2E7D32'; if (m >= 6) return '#F57F17'; return '#C62828'; };

  const renderAluno = ({ item }) => {
    const editando = notaEditando?.alunoId === item.aluno_id;
    return (
      <View style={styles.alunoCard}>
        <View style={styles.alunoHeader}>
          <View style={styles.alunoAvatar}>
            <Text style={styles.alunoAvatarText}>{item.aluno_nome?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alunoNome}>{item.aluno_nome}</Text>
            <Text style={styles.alunoMat}>Mat: {item.matricula}</Text>
          </View>
          {item.media != null && (
            <View style={[styles.mediaBadge, { backgroundColor: corMedia(item.media) }]}>
              <Text style={styles.mediaBadgeText}>{parseFloat(item.media).toFixed(1)}</Text>
              <Text style={styles.mediaBadgeLabel}>média</Text>
            </View>
          )}
        </View>

        {!editando ? (
          <View style={styles.notasRow}>
            <View style={styles.notaBox}>
              <Text style={styles.notaLabel}>N1</Text>
              <Text style={styles.notaVal}>{item.nota1 ?? '—'}</Text>
            </View>
            <View style={styles.notaBox}>
              <Text style={styles.notaLabel}>N2</Text>
              <Text style={styles.notaVal}>{item.nota2 ?? '—'}</Text>
            </View>
            <View style={[styles.notaBox, { backgroundColor: item.situacao === 'Aprovado' ? '#E8F5E9' : item.situacao ? '#FFEBEE' : '#F5F5F5' }]}>
              <Text style={styles.notaLabel}>Situação</Text>
              <Text style={[styles.notaVal, { fontSize: 12, color: item.situacao === 'Aprovado' ? '#2E7D32' : item.situacao ? '#C62828' : '#999' }]}>
                {item.situacao || 'Sem nota'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editNotaBtn} onPress={() => iniciarEdicao(item)}>
              <Text style={styles.editNotaText}>✏️</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editBox}>
            <View style={styles.editRow}>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Nota 1 (0–10)</Text>
                <TextInput
                  style={styles.editInput}
                  value={notaEditando.nota1}
                  onChangeText={v => setNotaEditando(p => ({ ...p, nota1: v }))}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                />
              </View>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Nota 2 (0–10)</Text>
                <TextInput
                  style={styles.editInput}
                  value={notaEditando.nota2}
                  onChangeText={v => setNotaEditando(p => ({ ...p, nota2: v }))}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                />
              </View>
            </View>
            <View style={styles.editActions}>
              {salvando
                ? <ActivityIndicator color={colors.primary} />
                : <>
                    <TouchableOpacity style={styles.saveNotaBtn} onPress={salvarNota}>
                      <Text style={styles.saveNotaText}>✓ Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelNotaBtn} onPress={() => setNotaEditando(null)}>
                      <Text style={styles.cancelNotaText}>✕ Cancelar</Text>
                    </TouchableOpacity>
                  </>}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Olá, {user?.nome?.split(' ')[0]}! 👋</Text>
          <Text style={styles.headerSub}>Portal do Professor</Text>
        </View>
        <Text style={styles.headerIcon}>👨‍🏫</Text>
      </View>

      {/* Info */}
      {user?.vinculo && (
        <View style={styles.infoCard}>
          <Text style={styles.infoNome}>{user.vinculo.nome}</Text>
          {user.vinculo.titulacao ? <Text style={styles.infoSub}>{user.vinculo.titulacao}</Text> : null}
          {user.vinculo.area ? <Text style={styles.infoSub}>📌 {user.vinculo.area}</Text> : null}
        </View>
      )}

      {/* Minhas Disciplinas */}
      <Text style={styles.secTitle}>📚 Minhas Disciplinas</Text>

      {loadingDisc ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
      ) : disciplinas.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Nenhuma disciplina vinculada a você.</Text>
        </View>
      ) : (
        disciplinas.map(d => (
          <TouchableOpacity key={d.id} style={styles.discCard} onPress={() => abrirDisciplina(d)} activeOpacity={0.8}>
            <View style={{ flex: 1 }}>
              <Text style={styles.discNome}>{d.nome}</Text>
              {d.curso    ? <Text style={styles.discSub}>🏫 {d.curso}</Text>   : null}
              {d.semestre ? <Text style={styles.discSub}>📅 {d.semestre}</Text> : null}
              <Text style={styles.discSub}>👥 {d.total_alunos ?? 0} aluno(s)</Text>
            </View>
            <View style={styles.discCH}>
              <Text style={styles.discCHNum}>{d.carga_horaria}</Text>
              <Text style={styles.discCHLabel}>h</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Ações */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AlterarSenha', { obrigatorio: false })}>
          <Text style={styles.actionIcon}>🔑</Text>
          <Text style={styles.actionLabel}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪  Sair</Text>
      </TouchableOpacity>

      {/* Modal: alunos da disciplina */}
      <Modal visible={modalVisivel} animationType="slide" onRequestClose={() => { setModalVisivel(false); setNotaEditando(null); }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setModalVisivel(false); setNotaEditando(null); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={styles.modalTitle} numberOfLines={1}>{discSelecionada?.nome}</Text>
              <Text style={styles.modalSub}>{discSelecionada?.curso}</Text>
            </View>
          </View>

          {loadingAlunos ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : alunos.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>Nenhum aluno matriculado nesta disciplina.</Text>
              <Text style={{ color: '#aaa', fontSize: 12, marginTop: 8 }}>
                Adicione alunos em Gerenciar {'>'} Disciplinas.
              </Text>
            </View>
          ) : (
            <FlatList
              data={alunos}
              keyExtractor={item => item.aluno_id.toString()}
              renderItem={renderAluno}
              contentContainerStyle={{ padding: 16 }}
              removeClippedSubviews={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { padding: 16, paddingBottom: 32, backgroundColor: colors.background },
  header:          { backgroundColor: colors.primary, borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerGreeting:  { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub:       { fontSize: 13, color: '#90CAF9', marginTop: 2 },
  headerIcon:      { fontSize: 40 },
  infoCard:        { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 16, marginBottom: 16 },
  infoNome:        { fontSize: 17, fontWeight: 'bold', color: '#1B5E20' },
  infoSub:         { fontSize: 13, color: '#555', marginTop: 2 },
  secTitle:        { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  discCard:        { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  discNome:        { fontSize: 15, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
  discSub:         { fontSize: 12, color: '#666', marginBottom: 2 },
  discCH:          { backgroundColor: '#E8F5E9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', marginLeft: 8 },
  discCHNum:       { fontSize: 20, fontWeight: 'bold', color: colors.secondary },
  discCHLabel:     { fontSize: 10, color: '#555' },
  emptyBox:        { alignItems: 'center', marginTop: 32 },
  emptyIcon:       { fontSize: 48, marginBottom: 8 },
  emptyText:       { color: '#888', fontSize: 15, textAlign: 'center' },
  actionsRow:      { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 16 },
  actionCard:      { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  actionIcon:      { fontSize: 28, marginBottom: 6 },
  actionLabel:     { fontSize: 13, fontWeight: '600', color: '#333' },
  logoutBtn:       { backgroundColor: '#D32F2F', borderRadius: 12, padding: 15, alignItems: 'center' },
  logoutText:      { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  // Modal
  modalHeader:     { backgroundColor: colors.primary, paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 54 : 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center' },
  modalClose:      { color: '#fff', fontSize: 22, fontWeight: 'bold', padding: 4 },
  modalTitle:      { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalSub:        { color: '#90CAF9', fontSize: 12 },
  // Cards de aluno
  alunoCard:       { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3 },
  alunoHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  alunoAvatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  alunoAvatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  alunoNome:       { fontSize: 15, fontWeight: 'bold', color: '#333' },
  alunoMat:        { fontSize: 12, color: '#888' },
  mediaBadge:      { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', marginLeft: 8 },
  mediaBadgeText:  { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  mediaBadgeLabel: { color: '#ffffffcc', fontSize: 9 },
  notasRow:        { flexDirection: 'row', gap: 6, alignItems: 'center' },
  notaBox:         { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 8, padding: 8, alignItems: 'center' },
  notaLabel:       { fontSize: 10, color: '#888', marginBottom: 2 },
  notaVal:         { fontSize: 16, color: '#333', fontWeight: '600' },
  editNotaBtn:     { backgroundColor: '#E3F2FD', borderRadius: 8, padding: 10, marginLeft: 6 },
  editNotaText:    { fontSize: 16 },
  editBox:         { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12 },
  editRow:         { flexDirection: 'row', gap: 12, marginBottom: 10 },
  editField:       { flex: 1 },
  editLabel:       { fontSize: 12, color: '#555', marginBottom: 4 },
  editInput:       { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 18, backgroundColor: '#fff', textAlign: 'center', fontWeight: 'bold' },
  editActions:     { flexDirection: 'row', gap: 8 },
  saveNotaBtn:     { flex: 1, backgroundColor: colors.secondary, borderRadius: 8, padding: 10, alignItems: 'center' },
  saveNotaText:    { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cancelNotaBtn:   { flex: 1, backgroundColor: '#FFEBEE', borderRadius: 8, padding: 10, alignItems: 'center' },
  cancelNotaText:  { color: '#C62828', fontWeight: 'bold', fontSize: 14 },
});
