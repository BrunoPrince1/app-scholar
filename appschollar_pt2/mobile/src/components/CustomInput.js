import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../styles/global';

export default function CustomInput({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default' }) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 16, color: colors.text, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});