import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';

export default function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>💈 BARBERPRO</Text>
        <Text style={styles.subtitle}>Versão de Teste</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ App Funcionando!</Text>
          <Text style={styles.cardText}>
            Se você está vendo esta tela, o Expo Go está funcionando corretamente.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧪 Teste de Estado</Text>
          <Text style={styles.cardText}>Contador: {count}</Text>
          <Button title="➕ Incrementar" onPress={() => setCount(count + 1)} color="#22c55e" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Status do Sistema</Text>
          <Text style={styles.statusItem}>✅ React Native: OK</Text>
          <Text style={styles.statusItem}>✅ Expo Go: OK</Text>
          <Text style={styles.statusItem}>✅ Navigation: Pendente</Text>
          <Text style={styles.statusItem}>✅ Firebase: Desativado (Modo Demo)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Próximos Passos</Text>
          <Text style={styles.cardText}>
            1. Confirme que esta tela aparece{'\n'}
            2. Teste o botão de incrementar{'\n'}
            3. Se funcionar, ativaremos as telas completas
          </Text>
        </View>

        <Text style={styles.footer}>
          Versão Simplificada para Debug{'\n'}
          Build: {new Date().toLocaleString('pt-BR')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 10,
  },
  statusItem: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 6,
  },
  footer: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
});
