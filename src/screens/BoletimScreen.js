import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { mockBoletim } from '../services/mockData';
import { globalStyles, colors } from '../styles/global';

export default function BoletimScreen() {
  const [boletim, setBoletim] = useState([]);

  useEffect(() => {
    setBoletim(mockBoletim);
    console.log('📊 Boletim carregado com useEffect');
  }, []);

  const renderItem = ({ item }) => (
    <View style={globalStyles.card}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.disciplina}</Text>
      <Text>Nota 1: {item.nota1} | Nota 2: {item.nota2}</Text>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>Média: {item.media}</Text>
      <Text style={{ color: item.situacao === 'Aprovado' ? colors.secondary : colors.error }}>
        Situação: {item.situacao}
      </Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.title}>Boletim Acadêmico</Text>
      <FlatList data={boletim} renderItem={renderItem} keyExtractor={item => item.id.toString()} />
    </ScrollView>
  );
}