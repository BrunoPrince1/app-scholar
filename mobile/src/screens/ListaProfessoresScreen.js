import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet, TextInput, Modal,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/global';
import { listarProfessores, atualizarProfessor, deletarProfessor } from '../services/academicService';

const FORM_VAZIO = { nome: '', titulacao: '', area: '', tempo_docencia: '', email: '' };
const TITULACOES = ['Graduado', 'Especialista', 'Mestre', 'Doutor', 'Pós-Doutor'];

export default function ListaProfessoresScreen() {
  const [professores, setProfessores] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [profEditando, setProfEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [mostrarTitulacoes, setMostrarTitulacoes] = useState(false);

  useFocusEffect(useCallback(() => { carregarProfessores(); }, []));

  const carregarProfessores = async () => {
    setLoading(true);
    try {
      const dados = await listarProfessores();
      setProfessores(dados);
      setFiltrados(dados);
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  const handleBusca = (texto) => {
    setBusca(texto);
    const t = texto.toLowerCase();
    setFiltrados(professores.filter(p =>
      p.nome.toLowerCase().includes(t) ||
      (p.area || '').toLowerCase().includes(t) ||
      (p.titulacao || '').toLowerCase().includes(t) ||
      (p.email || '').toLowerCase().includes(t)
    ));
  };

  const abrirEdicao = (prof) => {
    setProfEditando(prof);
    setForm({
      nome: prof.nome || '', titulacao: prof.titulacao || '',
      area: prof.area || '', tempo_docencia: prof.tempo_docencia?.toString() || '',
      email: prof.email || '',
    });
    setMostrarTitulacoes(false);
    setModalVisivel(true);
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const salvarEdicao = async () => {
    if (!form.nome || !form.email) {
      Alert.alert('Erro', 'Nome e e-mail são obrigatórios.');
      return;
    }
    setSalvando(true);
    try {
      await atualizarProfessor(profEditando.id, { ...form, tempo_docencia: parseInt(form.tempo_docencia) || 0 });
      setModalVisivel(false);
      await carregarProfessores();
      Alert.alert('Sucesso', 'Professor atualizado!');
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setSalvando(false); }
  };

  const confirmarExclusao = (prof) => {
    Alert.alert(
      'Excluir Professor',
      `Excluir "${prof.nome}"?\nAs disciplinas vinculadas ficarão sem professor.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirProfessor(prof.id) },
      ],
      { cancelable: true }
    );
  };

  const excluirProfessor = async (id) => {
    try {
      await deletarProfessor(id);
      setProfessores(prev => prev.filter(p => p.id !== id));
      setFiltrados(prev => prev.filter(p => p.id !== id));
    } catch (err) { Alert.alert('Erro', err.message); }
  };

  const badgeColor = (t) => ({
    Doutor: '#4A148C', 'Pós-Doutor': '#1A237E',
    Mestre: '#1B5E20', Especialista: '#E65100', Graduado: '#37474F',
  }[t] || '#607D8B');

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: badgeColor(item.titulacao) }]}>
          <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome}>{item.nome}</Text>
          {item.titulacao
            ? <View style={[styles.badge, { backgroundColor: badgeColor(item.titulacao) }]}>
                <Text style={styles.badgeText}>{item.titulacao}</Text>
              </View>
            : null}
          {item.area ? <Text style={styles.cardSub}>📌 {item.area}</Text> : null}
          <Text style={styles.cardSub}>✉️  {item.email}</Text>
          {item.tempo_docencia ? <Text style={styles.cardSub}>🕐 {item.tempo_docencia} anos de docência</Text> : null}
        </View>
      </View>
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
        <TextInput style={styles.searchInput} placeholder="🔍  Buscar por nome, área, titulação..." value={busca} onChangeText={handleBusca} placeholderTextColor="#999" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : filtrados.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👨‍🏫</Text>
          <Text style={styles.emptyText}>{busca ? 'Nenhum professor encontrado.' : 'Nenhum professor cadastrado ainda.'}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.contador}>{filtrados.length} professor{filtrados.length !== 1 ? 'es' : ''}</Text>
          <FlatList
            data={filtrados}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
          />
        </>
      )}

      <Modal visible={modalVisivel} animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisivel(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Professor</Text>
            <View style={{ width: 32 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Nome *</Text>
              <TextInput style={styles.input} value={form.nome} onChangeText={v => handleChange('nome', v)} autoCapitalize="words" />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Titulação</Text>
              <TouchableOpacity style={styles.picker} onPress={() => setMostrarTitulacoes(v => !v)}>
                <Text style={{ color: form.titulacao ? colors.text : '#aaa' }}>{form.titulacao || 'Selecione a titulação'}</Text>
              </TouchableOpacity>
              {mostrarTitulacoes && (
                <View style={styles.dropdown}>
                  {TITULACOES.map(t => (
                    <TouchableOpacity key={t} style={styles.dropItem} onPress={() => { handleChange('titulacao', t); setMostrarTitulacoes(false); }}>
                      <Text>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Área de Atuação</Text>
              <TextInput style={styles.input} value={form.area} onChangeText={v => handleChange('area', v)} autoCapitalize="none" />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Tempo de Docência (anos)</Text>
              <TextInput style={styles.input} value={form.tempo_docencia} onChangeText={v => handleChange('tempo_docencia', v)} keyboardType="numeric" />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>E-mail *</Text>
              <TextInput style={styles.input} value={form.email} onChangeText={v => handleChange('email', v)} keyboardType="email-address" autoCapitalize="none" />
            </View>
            {salvando
              ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
              : <TouchableOpacity style={styles.saveBtn} onPress={salvarEdicao}><Text style={styles.saveBtnText}>💾  Salvar Alterações</Text></TouchableOpacity>}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  searchBar: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  contador: { paddingHorizontal: 16, paddingVertical: 8, color: '#888', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
  badge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardSub: { fontSize: 13, color: '#666', marginBottom: 2 },
  cardActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  editBtn: { backgroundColor: '#E3F2FD' },
  deleteBtn: { backgroundColor: '#FFEBEE' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#333' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#888', fontSize: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primary, paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 54 : 20, paddingBottom: 16 },
  modalClose: { color: '#fff', fontSize: 20, fontWeight: 'bold', padding: 4 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalBody: { padding: 20, paddingBottom: 40 },
  inputWrap: { marginBottom: 14 },
  inputLabel: { fontSize: 14, color: '#555', marginBottom: 4, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 11, fontSize: 15, backgroundColor: '#fff' },
  picker: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 11, backgroundColor: '#fff' },
  dropdown: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff', marginTop: 4 },
  dropItem: { padding: 11, borderBottomWidth: 1, borderBottomColor: '#eee' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
