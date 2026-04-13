import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles } from '../styles/global';

export default function CadastroProfessorScreen() {
  const [form, setForm] = useState({
    nome: '', titulacao: '', area: '', tempo: '', email: ''
  });

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = () => {
    if (!form.nome || !form.email) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios!');
      return;
    }
    console.log('Professor cadastrado:', form);
    Alert.alert('Sucesso', 'Professor cadastrado com sucesso!');
    setForm({ nome: '', titulacao: '', area: '', tempo: '', email: '' });
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <CustomInput label="Nome" value={form.nome} onChangeText={(v) => handleChange('nome', v)} />
      <CustomInput label="Titulação (ex: Mestre, Doutor)" value={form.titulacao} onChangeText={(v) => handleChange('titulacao', v)} />
      <CustomInput label="Área de Atuação" value={form.area} onChangeText={(v) => handleChange('area', v)} />
      <CustomInput label="Tempo de Docência (anos)" value={form.tempo} onChangeText={(v) => handleChange('tempo', v)} keyboardType="numeric" />
      <CustomInput label="E-mail" value={form.email} onChangeText={(v) => handleChange('email', v)} keyboardType="email-address" />
      
      <CustomButton title="Cadastrar Professor" onPress={handleSubmit} />
    </ScrollView>
  );
}