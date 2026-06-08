import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet, TextInput, Modal,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/global';
import {
  listarAlunos, todosAlunosDaDisciplina,
  lancarNota, removerAlunoDaDisciplina,
} from '../services/academicService';

export default function AlunosDisciplinaScreen({ route }) {
  const { disciplina } = route.params;

  // Todos os alunos da disciplina (com nota ou sem)
  const [matriculados,    setMatriculados]    = useState([]);
  // Todos os alunos do sistema (para vincular novo)
  const [todosAlunos,     setTodosAlunos]     = useState([]);
  const [loading,         setLoading]         = useState(true);

  // Modal de vincular aluno
  const [modalVincular,   setModalVincular]   = useState(false);
  const [busca,           setBusca]           = useState('');
  const [alunosFiltrados, setAlunosFiltrados] = useState([]);

  // Edição inline de nota
  const [notaEditando,    setNotaEditando]    = useState(null); // { alunoId, nota1, nota2 }
  const [salvando,        setSalvando]        = useState(false);

  useFocusEffect(useCallback(() => { carregarDados(); }, []));

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [matr, todos] = await Promise.all([
        todosAlunosDaDisciplina(disciplina.id),
        listarAlunos(),
      ]);
      setMatriculados(matr.filter(a => a.nota_id !== null)); // só quem tem vínculo (nota)
      setTodosAlunos(todos);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtro do modal de vincular
  const handleBusca = (texto) => {
    setBusca(texto);
    const t = texto.toLowerCase();
    // Excluir alunos já matriculados
    const idsMatriculados = new Set(matriculados.map(m => m.id));
    setAlunosFiltrados(
      todosAlunos.filter(a =>
        !idsMatriculados.has(a.id) &&
        (a.nome.toLowerCase().includes(t) ||
         a.matricula.toLowerCase().includes(t) ||
         (a.curso || '').toLowerCase().includes(t))
      )
    );
  };

  const abrirModalVincular = () => {
    const idsMatriculados = new Set(matriculados.map(m => m.id));
    setAlunosFiltrados(todosAlunos.filter(a => !idsMatriculados.has(a.id)));
    setBusca('');
    setModalVincular(true);
  };

  // Vincular aluno: cria nota zerada para criar o vínculo
  const vincularAluno = async (aluno) => {
    setModalVincular(false);
    try {
      await lancarNota({ aluno_id: aluno.id, disciplina_id: disciplina.id, nota1: 0, nota2: 0 });
      await carregarDados();
      Alert.alert('Sucesso', `${aluno.nome} adicionado à disciplina!\nNotas inicialmente zeradas — edite para lançar as notas reais.`);
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  const confirmarDesvincular = (item) => {
    Alert.alert(
      'Remover Aluno',
      `Remover ${item.nome} desta disciplina?\nAs notas serão apagadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => desvincularAluno(item.id) },
      ],
      { cancelable: true }
    );
  };

  const desvincularAluno = async (alunoId) => {
    try {
      await removerAlunoDaDisciplina(alunoId, disciplina.id);
      setMatriculados(prev => prev.filter(a => a.id !== alunoId));
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  const iniciarEdicaoNota = (item) => {
    setNotaEditando({
      alunoId: item.id,
      nota1:   item.nota1?.toString() || '0',
      nota2:   item.nota2?.toString() || '0',
    });
  };

  const salvarNota = async () => {
    const n1 = parseFloat(notaEditando.nota1);
    const n2 = parseFloat(notaEditando.nota2);
    if (isNaN(n1) || isNaN(n2) || n1 < 0 || n1 > 10 || n2 < 0 || n2 > 10) {
      Alert.alert('Erro', 'Notas devem ser números entre 0 e 10.');
      return;
    }
    setSalvando(true);
    try {
      await lancarNota({ aluno_id: notaEditando.alunoId, disciplina_id: disciplina.id, nota1: n1, nota2: n2 });
      await carregarDados();
      setNotaEditando(null);
      Alert.alert('Sucesso', 'Nota salva!');
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setSalvando(false);
    }
  };

  const corMedia = (m) => { if (m >= 7) return '#2E7D32'; if (m >= 6) return '#F57F17'; return '#C62828'; };

  const renderMatriculado = ({ item }) => {
    const editando = notaEditando?.alunoId === item.id;
    const media = item.media != null ? parseFloat(item.media) : null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.nome?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardNome}>{item.nome}</Text>
            <Text style={styles.cardSub}>Mat: {item.matricula}</Text>
          </View>
          {media != null && (
            <View style={[styles.mediaBadge, { backgroundColor: corMedia(media) }]}>
              <Text style={styles.mediaBadgeText}>{media.toFixed(1)}</Text>
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
            <TouchableOpacity style={styles.editBtn} onPress={() => iniciarEdicaoNota(item)}>
              <Text>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.delBtn} onPress={() => confirmarDesvincular(item)}>
              <Text>🗑️</Text>
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
                  autoFocus
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
            {salvando
              ? <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} />
              : (
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.saveBtn} onPress={salvarNota}>
                    <Text style={styles.saveBtnText}>✓ Salvar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setNotaEditando(null)}>
                    <Text style={styles.cancelBtnText}>✕ Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header da disciplina */}
      <View style={styles.discHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.discNome}>{disciplina.nome}</Text>
          {disciplina.curso ? <Text style={styles.discSub}>🏫 {disciplina.curso}</Text> : null}
          {disciplina.semestre ? <Text style={styles.discSub}>📅 {disciplina.semestre}</Text> : null}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={abrirModalVincular}>
          <Text style={styles.addBtnText}>+ Aluno</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : matriculados.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>Nenhum aluno nesta disciplina.</Text>
          <TouchableOpacity style={styles.addEmptyBtn} onPress={abrirModalVincular}>
            <Text style={styles.addEmptyText}>+ Adicionar primeiro aluno</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.contador}>{matriculados.length} aluno{matriculados.length !== 1 ? 's' : ''}</Text>
          <FlatList
            data={matriculados}
            keyExtractor={item => item.id.toString()}
            renderItem={renderMatriculado}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            removeClippedSubviews={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Modal: vincular aluno */}
      <Modal visible={modalVincular} animationType="slide" onRequestClose={() => setModalVincular(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVincular(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Adicionar Aluno</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.modalSearch}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍  Buscar por nome ou matrícula..."
              value={busca}
              onChangeText={handleBusca}
              placeholderTextColor="#999"
              autoFocus
            />
          </View>

          {alunosFiltrados.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                {busca ? 'Nenhum aluno encontrado.' : 'Todos os alunos já estão na disciplina.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={alunosFiltrados}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.alunoRow} onPress={() => vincularAluno(item)}>
                  <View style={styles.alunoRowAvatar}>
                    <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alunoRowNome}>{item.nome}</Text>
                    <Text style={styles.alunoRowSub}>Mat: {item.matricula}{item.curso ? ` — ${item.curso}` : ''}</Text>
                  </View>
                  <Text style={styles.alunoRowAdd}>+</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 24 }}
              removeClippedSubviews={false}
            />
          )}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: colors.background },
  discHeader:      { backgroundColor: colors.primary, padding: 16, flexDirection: 'row', alignItems: 'center' },
  discNome:        { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  discSub:         { fontSize: 12, color: '#90CAF9' },
  addBtn:          { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, marginLeft: 12 },
  addBtnText:      { color: colors.primary, fontWeight: 'bold', fontSize: 14 },
  contador:        { paddingHorizontal: 16, paddingVertical: 8, color: '#888', fontSize: 13 },
  empty:           { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyIcon:       { fontSize: 48, marginBottom: 8 },
  emptyText:       { color: '#888', fontSize: 15, textAlign: 'center' },
  addEmptyBtn:     { marginTop: 16, backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 24 },
  addEmptyText:    { color: '#fff', fontWeight: 'bold' },
  card:            { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3 },
  cardTop:         { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar:          { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText:      { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cardNome:        { fontSize: 15, fontWeight: 'bold', color: '#333' },
  cardSub:         { fontSize: 12, color: '#888' },
  mediaBadge:      { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', marginLeft: 6 },
  mediaBadgeText:  { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  notasRow:        { flexDirection: 'row', gap: 6, alignItems: 'center' },
  notaBox:         { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 8, padding: 8, alignItems: 'center' },
  notaLabel:       { fontSize: 10, color: '#888', marginBottom: 2 },
  notaVal:         { fontSize: 16, color: '#333', fontWeight: '600' },
  editBtn:         { backgroundColor: '#E3F2FD', borderRadius: 8, padding: 8, marginLeft: 4 },
  delBtn:          { backgroundColor: '#FFEBEE', borderRadius: 8, padding: 8, marginLeft: 4 },
  editBox:         { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12 },
  editRow:         { flexDirection: 'row', gap: 12, marginBottom: 10 },
  editField:       { flex: 1 },
  editLabel:       { fontSize: 12, color: '#555', marginBottom: 4 },
  editInput:       { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 20, backgroundColor: '#fff', textAlign: 'center', fontWeight: 'bold' },
  editActions:     { flexDirection: 'row', gap: 8 },
  saveBtn:         { flex: 1, backgroundColor: colors.secondary, borderRadius: 8, padding: 10, alignItems: 'center' },
  saveBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cancelBtn:       { flex: 1, backgroundColor: '#FFEBEE', borderRadius: 8, padding: 10, alignItems: 'center' },
  cancelBtnText:   { color: '#C62828', fontWeight: 'bold', fontSize: 14 },
  // Modal
  modalHeader:     { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 54 : 20, paddingBottom: 16 },
  modalClose:      { color: '#fff', fontSize: 20, fontWeight: 'bold', padding: 4 },
  modalTitle:      { flex: 1, color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  modalSearch:     { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput:     { backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  alunoRow:        { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
  alunoRowAvatar:  { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  alunoRowNome:    { fontSize: 15, fontWeight: '600', color: '#333' },
  alunoRowSub:     { fontSize: 12, color: '#888', marginTop: 2 },
  alunoRowAdd:     { fontSize: 24, color: colors.primary, fontWeight: 'bold', paddingHorizontal: 8 },
});
