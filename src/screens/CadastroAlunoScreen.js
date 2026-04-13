import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles } from '../styles/global';

export default function CadastroAlunoScreen() {
  const [form, setForm] = useState({
    nome: '', matricula: '', curso: '', email: '', telefone: '',
    cep: '', endereco: '', cidade: '', estado: ''
  });

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = () => {
    if (!form.nome || !form.matricula || !form.email) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios!');
      return;
    }
    console.log('Aluno cadastrado:', form);
    Alert.alert('Sucesso', 'Aluno cadastrado com sucesso!');
    setForm({ nome: '', matricula: '', curso: '', email: '', telefone: '', cep: '', endereco: '', cidade: '', estado: '' });
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <CustomInput label="Nome" value={form.nome} onChangeText={(v) => handleChange('nome', v)} />
      <CustomInput label="Matrícula" value={form.matricula} onChangeText={(v) => handleChange('matricula', v)} />
      <CustomInput label="Curso" value={form.curso} onChangeText={(v) => handleChange('curso', v)} />
      <CustomInput label="E-mail" value={form.email} onChangeText={(v) => handleChange('email', v)} keyboardType="email-address" />
      <CustomInput label="Telefone" value={form.telefone} onChangeText={(v) => handleChange('telefone', v)} keyboardType="phone-pad" />
      <CustomInput label="CEP" value={form.cep} onChangeText={(v) => handleChange('cep', v)} keyboardType="numeric" />
      <CustomInput label="Endereço" value={form.endereco} onChangeText={(v) => handleChange('endereco', v)} />
      <CustomInput label="Cidade" value={form.cidade} onChangeText={(v) => handleChange('cidade', v)} />
      <CustomInput label="Estado" value={form.estado} onChangeText={(v) => handleChange('estado', v)} />
      
      <CustomButton title="Cadastrar Aluno" onPress={handleSubmit} />
    </ScrollView>
  );
}