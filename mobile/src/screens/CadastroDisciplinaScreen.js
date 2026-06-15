import React, { useState, useEffect } from 'react';
import {
  ScrollView, Alert, ActivityIndicator, Text,
  View, TouchableOpacity, StyleSheet,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles, colors } from '../styles/global';
import { criarDisciplina, listarProfessores } from '../services/academicService';

export default function CadastroDisciplinaScreen() {
  const [form, setForm] = useState({
    nome: '', carga_horaria: '', professor_id: '', curso: '', semestre: '',
  });
  const [professores, setProfessores] = useState([]);
  const [professorNome, setProfessorNome] = useState('');
  const [mostrarProfessores, setMostrarProfessores] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfs, setLoadingProfs] = useState(true);

  useEffect(() => {
    listarProfessores()
      .then(setProfessores)
      .catch(() => Alert.alert('Aviso', 'Não foi possível carregar professores.'))
      .finally(() => setLoadingProfs(false));
  }, []);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSelecionarProfessor = (prof) => {
    setForm((prev) => ({ ...prev, professor_id: prof.id.toString() }));
    setProfessorNome(prof.nome);
    setMostrarProfessores(false);
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.carga_horaria) {
      Alert.alert('Erro', 'Nome e carga horária são obrigatórios!');
      return;
    }
    setLoading(true);
    try {
      await criarDisciplina({
        nome: form.nome,
        carga_horaria: parseInt(form.carga_horaria),
        professor_id: form.professor_id ? parseInt(form.professor_id) : null,
        curso: form.curso,
        semestre: form.semestre,
      });
      Alert.alert('Sucesso', 'Disciplina cadastrada com sucesso!');
      setForm({ nome: '', carga_horaria: '', professor_id: '', curso: '', semestre: '' });
      setProfessorNome('');
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <CustomInput label="Nome da Disciplina *" value={form.nome} onChangeText={(v) => handleChange('nome', v)} />
      <CustomInput label="Carga Horária (horas) *" value={form.carga_horaria} onChangeText={(v) => handleChange('carga_horaria', v)} keyboardType="numeric" />

      {/* Seletor de Professor */}
      <Text style={styles.label}>Professor Responsável</Text>
      {loadingProfs ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 15 }} />
      ) : (
        <>
          <TouchableOpacity style={styles.picker} onPress={() => setMostrarProfessores((v) => !v)}>
            <Text style={{ color: professorNome ? colors.text : '#aaa' }}>
              {professorNome || 'Selecione um professor'}
            </Text>
          </TouchableOpacity>
          {mostrarProfessores && (
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {professores.length === 0 ? (
                  <Text style={{ padding: 12, color: '#888' }}>Nenhum professor cadastrado.</Text>
                ) : (
                  professores.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.dropItem}
                      onPress={() => handleSelecionarProfessor(p)}
                    >
                      <Text>{p.nome}</Text>
                      <Text style={{ fontSize: 12, color: '#888' }}>{p.titulacao} — {p.area}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </>
      )}

      <CustomInput label="Curso" value={form.curso} onChangeText={(v) => handleChange('curso', v)} />
      <CustomInput label="Semestre (ex: 3° Semestre)" value={form.semestre} onChangeText={(v) => handleChange('semestre', v)} />

      {loading
        ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        : <CustomButton title="Cadastrar Disciplina" onPress={handleSubmit} />}
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
});
