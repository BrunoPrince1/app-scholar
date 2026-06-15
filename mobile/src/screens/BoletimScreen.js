import React, { useState } from 'react';
import {
  View, Text, ScrollView, FlatList, ActivityIndicator,
  StyleSheet, TouchableOpacity,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { globalStyles, colors } from '../styles/global';
import { consultarBoletim } from '../services/academicService';

export default function BoletimScreen() {
  const [matricula, setMatricula] = useState('');
  const [boletim, setBoletim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleConsultar = async () => {
    if (!matricula.trim()) {
      setErro('Informe a matrícula do aluno.');
      return;
    }
    setErro('');
    setLoading(true);
    setBoletim(null);
    try {
      const dados = await consultarBoletim(matricula.trim());
      setBoletim(dados);
    } catch (err) {
      setErro(err.message || 'Aluno não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  const corSituacao = (situacao) =>
    situacao === 'Aprovado' ? colors.secondary : colors.error;

  const renderItem = ({ item }) => (
    <View style={[globalStyles.card, styles.card]}>
      <Text style={styles.disciplinaNome}>{item.disciplina}</Text>
      <View style={styles.notasRow}>
        <View style={styles.notaBox}>
          <Text style={styles.notaLabel}>Nota 1</Text>
          <Text style={styles.notaValor}>{item.nota1?.toFixed(1)}</Text>
        </View>
        <View style={styles.notaBox}>
          <Text style={styles.notaLabel}>Nota 2</Text>
          <Text style={styles.notaValor}>{item.nota2?.toFixed(1)}</Text>
        </View>
        <View style={[styles.notaBox, styles.mediaBox]}>
          <Text style={styles.notaLabel}>Média</Text>
          <Text style={[styles.notaValor, { fontWeight: 'bold' }]}>{item.media?.toFixed(2)}</Text>
        </View>
      </View>
      <View style={[styles.situacaoBadge, { backgroundColor: corSituacao(item.situacao) }]}>
        <Text style={styles.situacaoText}>{item.situacao}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <Text style={globalStyles.title}>Consulta de Boletim</Text>

      <View style={styles.searchBox}>
        <CustomInput
          label="Matrícula do Aluno"
          value={matricula}
          onChangeText={setMatricula}
          placeholder="Ex: 2024001"
          keyboardType="default"
        />
        {erro ? <Text style={styles.erroText}>{erro}</Text> : null}
        {loading
          ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 16 }} />
          : <CustomButton title="Consultar Boletim" onPress={handleConsultar} />}
      </View>

      {boletim && (
        <View>
          <View style={[globalStyles.card, styles.alunoCard]}>
            <Text style={styles.alunoNome}>{boletim.aluno}</Text>
            <Text style={styles.alunoInfo}>Matrícula: {boletim.matricula}</Text>
            {boletim.curso ? <Text style={styles.alunoInfo}>Curso: {boletim.curso}</Text> : null}
          </View>

          {boletim.disciplinas.length === 0 ? (
            <Text style={styles.semNotas}>Nenhuma nota lançada para este aluno.</Text>
          ) : (
            <FlatList
              data={boletim.disciplinas}
              renderItem={renderItem}
              keyExtractor={(item, idx) => idx.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchBox: { marginBottom: 16 },
  erroText: { color: colors.error, textAlign: 'center', marginBottom: 8 },
  alunoCard: { backgroundColor: colors.primary, marginBottom: 16 },
  alunoNome: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  alunoInfo: { color: '#cce5ff', fontSize: 14 },
  card: { marginBottom: 12 },
  disciplinaNome: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  notasRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  notaBox: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8,
    padding: 10, alignItems: 'center',
  },
  mediaBox: { backgroundColor: '#e8f5e9' },
  notaLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  notaValor: { fontSize: 20, color: colors.text },
  situacaoBadge: {
    borderRadius: 20, paddingVertical: 4, paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  situacaoText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  semNotas: { textAlign: 'center', color: '#888', marginTop: 20 },
});
