import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles } from '../styles/global';

export default function CadastroDisciplinaScreen() {
  const [form, setForm] = useState({
    nome: '', carga: '', professor: '', curso: '', semestre: ''
  });

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = () => {
    if (!form.nome || !form.professor) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios!');
      return;
    }
    console.log('Disciplina cadastrada:', form);
    Alert.alert('Sucesso', 'Disciplina cadastrada com sucesso!');
    setForm({ nome: '', carga: '', professor: '', curso: '', semestre: '' });
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <CustomInput label="Nome da Disciplina" value={form.nome} onChangeText={(v) => handleChange('nome', v)} />
      <CustomInput label="Carga Horária" value={form.carga} onChangeText={(v) => handleChange('carga', v)} keyboardType="numeric" />
      <CustomInput label="Professor Responsável" value={form.professor} onChangeText={(v) => handleChange('professor', v)} />
      <CustomInput label="Curso" value={form.curso} onChangeText={(v) => handleChange('curso', v)} />
      <CustomInput label="Semestre" value={form.semestre} onChangeText={(v) => handleChange('semestre', v)} />
      
      <CustomButton title="Cadastrar Disciplina" onPress={handleSubmit} />
    </ScrollView>
  );
}