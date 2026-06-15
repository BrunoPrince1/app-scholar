import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet, TextInput, Modal,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors } from '../styles/global';
import {
  listarAlunos, deletarAluno, atualizarAluno,
  buscarCep, listarEstados, listarCidadesPorEstado,
} from '../services/alunosService';

const FORM_VAZIO = {
  nome: '', matricula: '', curso: '', email: '',
  telefone: '', cep: '', endereco: '', cidade: '', estado: '',
};

export default function ListaAlunosScreen({ navigation }) {
  const [alunos, setAlunos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);

  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [mostrarEstados, setMostrarEstados] = useState(false);
  const [mostrarCidades, setMostrarCidades] = useState(false);

  useFocusEffect(useCallback(() => { carregarAlunos(); }, []));

  useEffect(() => {
    listarEstados().then(setEstados).catch(() => {});
  }, []);

  const carregarAlunos = async () => {
    setLoading(true);
    try {
      const dados = await listarAlunos();
      setAlunos(dados);
      setFiltrados(dados);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBusca = (texto) => {
    setBusca(texto);
    const t = texto.toLowerCase();
    setFiltrados(alunos.filter(a =>
      a.nome.toLowerCase().includes(t) ||
      a.matricula.toLowerCase().includes(t) ||
      (a.email || '').toLowerCase().includes(t) ||
      (a.curso || '').toLowerCase().includes(t)
    ));
  };

  const abrirEdicao = (aluno) => {
    setAlunoEditando(aluno);
    setForm({
      nome: aluno.nome || '', matricula: aluno.matricula || '',
      curso: aluno.curso || '', email: aluno.email || '',
      telefone: aluno.telefone || '', cep: aluno.cep || '',
      endereco: aluno.endereco || '', cidade: aluno.cidade || '',
      estado: aluno.estado || '',
    });
    setMostrarEstados(false);
    setMostrarCidades(false);
    if (aluno.estado) {
      listarCidadesPorEstado(aluno.estado).then(setCidades).catch(() => {});
    }
    setModalVisivel(true);
  };

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleBuscarCep = async () => {
    if (!form.cep) return;
    setCepLoading(true);
    try {
      const dados = await buscarCep(form.cep);
      setForm(prev => ({
        ...prev,
        endereco: dados.endereco || prev.endereco,
        cidade: dados.cidade, estado: dados.estado,
      }));
      if (dados.estado) {
        const cids = await listarCidadesPorEstado(dados.estado);
        setCidades(cids);
      }
    } catch (err) { Alert.alert('CEP', err.message); }
    finally { setCepLoading(false); }
  };

  const handleSelecionarEstado = async (sigla) => {
    handleChange('estado', sigla);
    handleChange('cidade', '');
    setMostrarEstados(false);
    try { setCidades(await listarCidadesPorEstado(sigla)); }
    catch { setCidades([]); }
  };

  const salvarEdicao = async () => {
    if (!form.nome || !form.matricula || !form.email) {
      Alert.alert('Erro', 'Nome, matrícula e e-mail são obrigatórios.');
      return;
    }
    setSalvando(true);
    try {
      await atualizarAluno(alunoEditando.id, form);
      setModalVisivel(false);
      await carregarAlunos();
      Alert.alert('Sucesso', 'Aluno atualizado!');
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setSalvando(false); }
  };

  // ── EXCLUSÃO: sem Modal aberto, Alert puro funciona em qualquer contexto ──
  const confirmarExclusao = (aluno) => {
    Alert.alert(
      'Excluir Aluno',
      `Excluir "${aluno.nome}"?\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirAluno(aluno.id) },
      ],
      { cancelable: true }
    );
  };

  const excluirAluno = async (id) => {
    try {
      await deletarAluno(id);
      // Atualiza lista localmente sem nova requisição para feedback imediato
      setAlunos(prev => prev.filter(a => a.id !== id));
      setFiltrados(prev => prev.filter(a => a.id !== id));
    } catch (err) { Alert.alert('Erro', err.message); }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome}>{item.nome}</Text>
          <Text style={styles.cardSub}>Mat: {item.matricula}</Text>
          {item.curso ? <Text style={styles.cardSub}>{item.curso}</Text> : null}
          <Text style={styles.cardSub}>{item.email}</Text>
          {item.cidade ? <Text style={styles.cardSub}>📍 {item.cidade}{item.estado ? ` — ${item.estado}` : ''}</Text> : null}
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.notasBtn]}
          onPress={() => navigation.navigate('LancarNotas', { aluno: item })}
        >
          <Text style={styles.actionBtnText}>📝 Notas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => abrirEdicao(item)}
        >
          <Text style={styles.actionBtnText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => confirmarExclusao(item)}
        >
          <Text style={styles.actionBtnText}>🗑️ Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Buscar por nome, matrícula, curso..."
          value={busca}
          onChangeText={handleBusca}
          placeholderTextColor="#999"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : filtrados.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👩‍🎓</Text>
          <Text style={styles.emptyText}>
            {busca ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado ainda.'}
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.contador}>
            {filtrados.length} aluno{filtrados.length !== 1 ? 's' : ''}
          </Text>
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

      {/* Modal de Edição */}
      <Modal visible={modalVisivel} animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisivel(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Aluno</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            {[
              { field: 'nome', label: 'Nome *' },
              { field: 'matricula', label: 'Matrícula *' },
              { field: 'curso', label: 'Curso' },
              { field: 'email', label: 'E-mail *', kb: 'email-address' },
              { field: 'telefone', label: 'Telefone', kb: 'phone-pad' },
            ].map(({ field, label, kb }) => (
              <View key={field} style={styles.inputWrap}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[field]}
                  onChangeText={v => handleChange(field, v)}
                  keyboardType={kb || 'default'}
                  autoCapitalize="none"
                />
              </View>
            ))}

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>CEP</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={form.cep}
                  onChangeText={v => handleChange('cep', v)}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={[styles.cepBtn, { backgroundColor: cepLoading ? '#ccc' : colors.primary }]}
                  onPress={handleBuscarCep}
                  disabled={cepLoading}
                >
                  {cepLoading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Buscar</Text>}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Endereço</Text>
              <TextInput style={styles.input} value={form.endereco} onChangeText={v => handleChange('endereco', v)} autoCapitalize="none" />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Estado</Text>
              <TouchableOpacity style={styles.picker} onPress={() => { setMostrarEstados(v => !v); setMostrarCidades(false); }}>
                <Text style={{ color: form.estado ? colors.text : '#aaa' }}>
                  {form.estado || 'Selecione o estado'}
                </Text>
              </TouchableOpacity>
              {mostrarEstados && (
                <View style={styles.dropdown}>
                  <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                    {estados.map(e => (
                      <TouchableOpacity key={e.sigla} style={styles.dropItem} onPress={() => handleSelecionarEstado(e.sigla)}>
                        <Text>{e.sigla} — {e.nome}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Cidade</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => { if (cidades.length > 0) { setMostrarCidades(v => !v); setMostrarEstados(false); } }}
              >
                <Text style={{ color: form.cidade ? colors.text : '#aaa' }}>
                  {form.cidade || (cidades.length === 0 ? 'Selecione o estado primeiro' : 'Selecione a cidade')}
                </Text>
              </TouchableOpacity>
              {mostrarCidades && (
                <View style={styles.dropdown}>
                  <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                    {cidades.map(c => (
                      <TouchableOpacity key={c} style={styles.dropItem} onPress={() => { handleChange('cidade', c); setMostrarCidades(false); }}>
                        <Text>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {salvando
              ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
              : (
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
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  contador: { paddingHorizontal: 16, paddingVertical: 8, color: '#888', fontSize: 13 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    padding: 16, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 2 },
  cardSub: { fontSize: 13, color: '#666', marginBottom: 1 },
  cardActions: { flexDirection: 'row', gap: 6, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  notasBtn: { backgroundColor: '#FFF8E1' },
  editBtn: { backgroundColor: '#E3F2FD' },
  deleteBtn: { backgroundColor: '#FFEBEE' },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#333' },
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
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 11, fontSize: 15, backgroundColor: '#fff' },
  picker: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 11, backgroundColor: '#fff' },
  dropdown: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff', marginTop: 4 },
  dropItem: { padding: 11, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cepBtn: { paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 46 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
