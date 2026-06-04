import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function MenuPrincipal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>❌ El Gato ⭕</Text>
      <Text style={styles.subtitle}>¡Ahora con Modo Online!</Text>
      
      {/* Botón Local con estilo único (sin arreglos) */}
      <Link href="/game" asChild>
        <Pressable style={styles.buttonLocal}>
          <Text style={styles.buttonText}>Jugar Local</Text>
        </Pressable>
      </Link>

      {/* Botón Online con estilo único (sin arreglos) */}
      <Link href="/online" asChild>
        <Pressable style={styles.buttonOnline}>
          <Text style={styles.buttonText}>Jugar Online 🌐</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#a6adc8',
    marginBottom: 25,
  },
  // Estilos base repetidos dentro de cada botón para evitar el conflicto en Web
  buttonLocal: {
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 12,
    width: 220,
    alignItems: 'center',
    backgroundColor: '#89b4fa', // Azul
    marginBottom: 15,
  },
  buttonOnline: {
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 12,
    width: 220,
    alignItems: 'center',
    backgroundColor: '#cba6f7', // Morado
  },
  buttonText: {
    color: '#11111b',
    fontSize: 18,
    fontWeight: 'bold',
  },
});