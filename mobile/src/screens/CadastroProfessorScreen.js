import React, { useState } from 'react';
import { ScrollView, Alert, ActivityIndicator } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles, colors } from '../styles/global';
import { criarProfessor } from '../services/academicService';

export default function CadastroProfessorScreen() {
  const [form, setForm] = useState({
    nome: '', titulacao: '', area: '', tempo_docencia: '', email: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.nome || !form.email) {
      Alert.alert('Erro', 'Nome e e-mail são obrigatórios!');
      return;
    }
    setLoading(true);
    try {
      await criarProfessor({
        ...form,
        tempo_docencia: parseInt(form.tempo_docencia) || 0,
      });
      Alert.alert('Sucesso', 'Professor cadastrado com sucesso!');
      setForm({ nome: '', titulacao: '', area: '', tempo_docencia: '', email: '' });
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <CustomInput label="Nome *" value={form.nome} onChangeText={(v) => handleChange('nome', v)} />
      <CustomInput label="Titulação (ex: Mestre, Doutor)" value={form.titulacao} onChangeText={(v) => handleChange('titulacao', v)} />
      <CustomInput label="Área de Atuação" value={form.area} onChangeText={(v) => handleChange('area', v)} />
      <CustomInput label="Tempo de Docência (anos)" value={form.tempo_docencia} onChangeText={(v) => handleChange('tempo_docencia', v)} keyboardType="numeric" />
      <CustomInput label="E-mail *" value={form.email} onChangeText={(v) => handleChange('email', v)} keyboardType="email-address" />

      {loading
        ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        : <CustomButton title="Cadastrar Professor" onPress={handleSubmit} />}
    </ScrollView>
  );
}
