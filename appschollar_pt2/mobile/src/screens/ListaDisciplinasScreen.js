import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet, TextInput, Modal,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/global';
import {
  listarDisciplinas, atualizarDisciplina, deletarDisciplina,
  listarProfessores,
} from '../services/academicService';

const FORM_VAZIO = { nome: '', carga_horaria: '', professor_id: '', curso: '', semestre: '' };

export default function ListaDisciplinasScreen() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [disciplinaEditando, setDisciplinaEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [profNome, setProfNome] = useState('');
  const [mostrarProfs, setMostrarProfs] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [disc, profs] = await Promise.all([listarDisciplinas(), listarProfessores()]);
      setDisciplinas(disc);
      setFiltrados(disc);
      setProfessores(profs);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBusca = (texto) => {
    setBusca(texto);
    const t = texto.toLowerCase();
    setFiltrados(
      disciplinas.filter(
        (d) =>
          d.nome.toLowerCase().includes(t) ||
          (d.curso || '').toLowerCase().includes(t) ||
          (d.semestre || '').toLowerCase().includes(t) ||
          (d.professor_nome || '').toLowerCase().includes(t)
      )
    );
  };

  const abrirEdicao = (disc) => {
    setDisciplinaEditando(disc);
    setForm({
      nome: disc.nome || '',
      carga_horaria: disc.carga_horaria?.toString() || '',
      professor_id: disc.professor_id?.toString() || '',
      curso: disc.curso || '',
      semestre: disc.semestre || '',
    });
    setProfNome(disc.professor_nome || '');
    setMostrarProfs(false);
    setModalVisivel(true);
  };

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSelecionarProf = (prof) => {
    setForm((prev) => ({ ...prev, professor_id: prof.id.toString() }));
    setProfNome(prof.nome);
    setMostrarProfs(false);
  };

  const salvarEdicao = async () => {
    if (!form.nome || !form.carga_horaria) {
      Alert.alert('Erro', 'Nome e carga horária são obrigatórios.');
      return;
    }
    setSalvando(true);
    try {
      await atualizarDisciplina(disciplinaEditando.id, {
        nome: form.nome,
        carga_horaria: parseInt(form.carga_horaria),
        professor_id: form.professor_id ? parseInt(form.professor_id) : null,
        curso: form.curso,
        semestre: form.semestre,
      });
      setModalVisivel(false);
      await carregarDados();
      Alert.alert('Sucesso', 'Disciplina atualizada!');
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = (disc) => {
    Alert.alert(
      'Excluir Disciplina',
      `Deseja excluir "${disc.nome}"?\nAs notas vinculadas também serão removidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirDisciplina(disc.id) },
      ]
    );
  };

  const excluirDisciplina = async (id) => {
    try {
      await deletarDisciplina(id);
      await carregarDados();
    } catch (err) {
      Alert.alert('Erro', err.message);
    }
  };

  const semestreColor = (sem) => {
    const n = parseInt((sem || '').replace(/\D/g, '')) || 0;
    const palette = ['#1565C0', '#2E7D32', '#E65100', '#6A1B9A', '#00695C', '#558B2F'];
    return palette[(n - 1) % palette.length] || '#607D8B';
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardNome}>{item.nome}</Text>
          {item.semestre ? (
            <View style={[styles.badge, { backgroundColor: semestreColor(item.semestre) }]}>
              <Text style={styles.badgeText}>{item.semestre}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.chBox}>
          <Text style={styles.chNum}>{item.carga_horaria}</Text>
          <Text style={styles.chLabel}>horas</Text>
        </View>
      </View>

      {item.curso ? (
        <Text style={styles.cardSub}>🏫 {item.curso}</Text>
      ) : null}
      {item.professor_nome ? (
        <Text style={styles.cardSub}>👨‍🏫 {item.professor_nome}</Text>
      ) : (
        <Text style={[styles.cardSub, { color: '#f4a261' }]}>⚠️  Sem professor vinculado</Text>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => abrirEdicao(item)}>
          <Text style={styles.actionBtnText}>✏️  Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => confirmarExclusao(item)}>
          <Text style={styles.actionBtnText}>🗑️  Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Buscar por nome, curso, semestre..."
          value={busca}
          onChangeText={handleBusca}
          placeholderTextColor="#999"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : filtrados.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>
            {busca ? 'Nenhuma disciplina encontrada.' : 'Nenhuma disciplina cadastrada ainda.'}
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.contador}>
            {filtrados.length} disciplina{filtrados.length !== 1 ? 's' : ''}
          </Text>
          <FlatList
            data={filtrados}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Modal de Edição */}
      <Modal visible={modalVisivel} animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisivel(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Disciplina</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Nome da Disciplina *</Text>
              <TextInput style={styles.input} value={form.nome} onChangeText={(v) => handleChange('nome', v)} autoCapitalize="words" />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Carga Horária (horas) *</Text>
              <TextInput style={styles.input} value={form.carga_horaria} onChangeText={(v) => handleChange('carga_horaria', v)} keyboardType="numeric" />
            </View>

            {/* Seletor de Professor */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Professor Responsável</Text>
              <TouchableOpacity style={styles.picker} onPress={() => setMostrarProfs((v) => !v)}>
                <Text style={{ color: profNome ? colors.text : '#aaa' }}>
                  {profNome || 'Selecione um professor'}
                </Text>
              </TouchableOpacity>
              {mostrarProfs && (
                <View style={styles.dropdown}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    <TouchableOpacity
                      style={styles.dropItem}
                      onPress={() => { handleChange('professor_id', ''); setProfNome(''); setMostrarProfs(false); }}
                    >
                      <Text style={{ color: '#888' }}>— Sem professor —</Text>
                    </TouchableOpacity>
                    {professores.map((p) => (
                      <TouchableOpacity key={p.id} style={styles.dropItem} onPress={() => handleSelecionarProf(p)}>
                        <Text>{p.nome}</Text>
                        <Text style={{ fontSize: 12, color: '#888' }}>{p.titulacao} — {p.area}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Curso</Text>
              <TextInput style={styles.input} value={form.curso} onChangeText={(v) => handleChange('curso', v)} autoCapitalize="words" />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Semestre</Text>
              <TextInput style={styles.input} value={form.semestre} onChangeText={(v) => handleChange('semestre', v)} placeholder="Ex: 3° Semestre" autoCapitalize="none" />
            </View>

            {salvando ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              <TouchableOpacity style={styles.saveBtn} onPress={salvarEdicao}>
                <Text style={styles.saveBtnText}>💾  Salvar Alterações</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  searchBar: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput: {
    backgroundColor: '#f0f0f0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
  },
  contador: { paddingHorizontal: 16, paddingVertical: 8, color: '#888', fontSize: 13 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    padding: 16, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
  badge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  chBox: {
    backgroundColor: '#E8F5E9', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', marginLeft: 8,
  },
  chNum: { fontSize: 20, fontWeight: 'bold', color: colors.secondary },
  chLabel: { fontSize: 10, color: '#666' },
  cardSub: { fontSize: 13, color: '#666', marginBottom: 3 },
  cardActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, marginTop: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  editBtn: { backgroundColor: '#E3F2FD' },
  deleteBtn: { backgroundColor: '#FFEBEE' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#333' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#888', fontSize: 16 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.primary, paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 20, paddingBottom: 16,
  },
  modalClose: { color: '#fff', fontSize: 20, fontWeight: 'bold', padding: 4 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalBody: { padding: 20, paddingBottom: 40 },
  inputWrap: { marginBottom: 14 },
  inputLabel: { fontSize: 14, color: '#555', marginBottom: 4, fontWeight: '500' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 11, fontSize: 15, backgroundColor: '#fff',
  },
  picker: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 11, backgroundColor: '#fff',
  },
  dropdown: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    backgroundColor: '#fff', marginTop: 4,
  },
  dropItem: { padding: 11, borderBottomWidth: 1, borderBottomColor: '#eee' },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
