import React, { useState, useEffect } from 'react';
import {
  ScrollView, Text, View, Alert, ActivityIndicator,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles, colors } from '../styles/global';
import { criarAluno, buscarCep, listarEstados, listarCidadesPorEstado } from '../services/alunosService';

export default function CadastroAlunoScreen() {
  const [form, setForm] = useState({
    nome: '', matricula: '', curso: '', email: '',
    telefone: '', cep: '', endereco: '', cidade: '', estado: '',
  });
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [mostrarEstados, setMostrarEstados] = useState(false);
  const [mostrarCidades, setMostrarCidades] = useState(false);

  // Carrega lista de estados do IBGE ao montar a tela
  useEffect(() => {
    listarEstados()
      .then(setEstados)
      .catch(() => console.warn('Não foi possível carregar estados do IBGE'));
  }, []);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // ViaCEP: preenche endereço automaticamente
  const handleBuscarCep = async () => {
    if (!form.cep) return;
    setCepLoading(true);
    try {
      const dados = await buscarCep(form.cep);
      setForm((prev) => ({
        ...prev,
        endereco: dados.endereco || prev.endereco,
        cidade: dados.cidade,
        estado: dados.estado,
      }));
      // Carregar cidades do estado retornado pelo CEP
      if (dados.estado) {
        const listaCidades = await listarCidadesPorEstado(dados.estado);
        setCidades(listaCidades);
      }
    } catch (err) {
      Alert.alert('CEP', err.message);
    } finally {
      setCepLoading(false);
    }
  };

  // IBGE: ao selecionar estado, carrega cidades
  const handleSelecionarEstado = async (sigla) => {
    handleChange('estado', sigla);
    handleChange('cidade', '');
    setMostrarEstados(false);
    try {
      const listaCidades = await listarCidadesPorEstado(sigla);
      setCidades(listaCidades);
    } catch {
      setCidades([]);
    }
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.matricula || !form.email) {
      Alert.alert('Erro', 'Nome, matrícula e e-mail são obrigatórios!');
      return;
    }
    setLoading(true);
    try {
      await criarAluno(form);
      Alert.alert('Sucesso', 'Aluno cadastrado com sucesso!');
      setForm({
        nome: '', matricula: '', curso: '', email: '',
        telefone: '', cep: '', endereco: '', cidade: '', estado: '',
      });
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <CustomInput label="Nome *" value={form.nome} onChangeText={(v) => handleChange('nome', v)} />
      <CustomInput label="Matrícula *" value={form.matricula} onChangeText={(v) => handleChange('matricula', v)} />
      <CustomInput label="Curso" value={form.curso} onChangeText={(v) => handleChange('curso', v)} />
      <CustomInput label="E-mail *" value={form.email} onChangeText={(v) => handleChange('email', v)} keyboardType="email-address" />
      <CustomInput label="Telefone" value={form.telefone} onChangeText={(v) => handleChange('telefone', v)} keyboardType="phone-pad" />

      {/* CEP com busca automática (ViaCEP) */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <CustomInput label="CEP" value={form.cep} onChangeText={(v) => handleChange('cep', v)} keyboardType="numeric" />
        </View>
        <TouchableOpacity
          style={[styles.cepBtn, { backgroundColor: cepLoading ? '#ccc' : colors.primary }]}
          onPress={handleBuscarCep}
          disabled={cepLoading}
        >
          {cepLoading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.cepBtnText}>Buscar</Text>}
        </TouchableOpacity>
      </View>

      <CustomInput label="Endereço" value={form.endereco} onChangeText={(v) => handleChange('endereco', v)} />

      {/* Seletor de Estado (IBGE) */}
      <Text style={styles.label}>Estado</Text>
      <TouchableOpacity style={styles.picker} onPress={() => setMostrarEstados((v) => !v)}>
        <Text style={{ color: form.estado ? colors.text : '#aaa' }}>
          {form.estado || 'Selecione o estado'}
        </Text>
      </TouchableOpacity>
      {mostrarEstados && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {estados.map((e) => (
              <TouchableOpacity key={e.sigla} style={styles.dropItem} onPress={() => handleSelecionarEstado(e.sigla)}>
                <Text>{e.sigla} — {e.nome}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Seletor de Cidade (IBGE) */}
      <Text style={styles.label}>Cidade</Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => cidades.length > 0 && setMostrarCidades((v) => !v)}
      >
        <Text style={{ color: form.cidade ? colors.text : '#aaa' }}>
          {form.cidade || (cidades.length === 0 ? 'Selecione o estado primeiro' : 'Selecione a cidade')}
        </Text>
      </TouchableOpacity>
      {mostrarCidades && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {cidades.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.dropItem}
                onPress={() => { handleChange('cidade', c); setMostrarCidades(false); }}
              >
                <Text>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading
        ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        : <CustomButton title="Cadastrar Aluno" onPress={handleSubmit} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, color: '#333', marginBottom: 5 },
  picker: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, backgroundColor: '#fff', marginBottom: 15,
  },
  dropdown: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    backgroundColor: '#fff', marginBottom: 15, marginTop: -10,
  },
  dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cepBtn: {
    padding: 12, borderRadius: 8, marginBottom: 15,
    alignItems: 'center', justifyContent: 'center', minWidth: 70,
  },
  cepBtnText: { color: '#fff', fontWeight: 'bold' },
});
