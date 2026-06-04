import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function MenuPrincipal() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>EL JUEGO DE</Text>

      <View style={styles.titleRow}>
        <Text style={styles.titleX}>X</Text>
        <Text style={styles.titleDash}> — </Text>
        <Text style={styles.titleO}>O</Text>
      </View>

      <View style={styles.subtitleRow}>
        <View style={styles.dot} />
        <Text style={styles.subtitle}>Modo online disponible</Text>
        <View style={styles.dot} />
      </View>

      <Link href="/cpu" asChild>
        <Pressable style={({ pressed }) => [styles.pressable, pressed && styles.buttonPressed]}>
          <View style={styles.buttonLocal2}>
            <Text style={styles.buttonTextDark}>     Contra CPU     </Text>
          </View>
        </Pressable>
      </Link>

<View style={styles.divider} />

      <Link href="/game" asChild>
        <Pressable style={({ pressed }) => [styles.pressable, pressed && styles.buttonPressed]}>
          <View style={styles.buttonLocal}>
            <Text style={styles.buttonTextDark}>     Jugar Local     </Text>
          </View>
        </Pressable>
      </Link>

      <View style={styles.divider} />

      <Link href="/online" asChild>
        <Pressable style={({ pressed }) => [styles.pressable, pressed && styles.buttonPressed]}>
          <View style={styles.buttonOnline}>
            <Text style={styles.buttonTextLight}>    Jugar Online    </Text>
          </View>
        </Pressable>
      </Link>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  eyebrow: {
    fontSize: 12,
    letterSpacing: 5,
    color: '#6c7086',
    marginBottom: 8,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleX: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#f38ba8',
    lineHeight: 80,
  },
  titleDash: {
    fontSize: 40,
    color: '#45475a',
    marginHorizontal: 6,
    lineHeight: 80,
  },
  titleO: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#89b4fa',
    lineHeight: 80,
  },

  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 48,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#a6e3a1',
  },
  subtitle: {
    fontSize: 13,
    color: '#a6e3a1',
    letterSpacing: 1,
  },

  // El Pressable solo maneja área de toque, sin color
  pressable: {
    width: '100%',
  },

  // El View interno carga todo el estilo visual
  buttonLocal: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#a6e3a1',
  },
  buttonLocal2: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#f38ba8',
  },
  buttonOnline: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#5783ca',
    borderWidth: 1.5,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  buttonTextDark: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonTextLight: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  divider: {
    width: 40,
    height: 1,
    backgroundColor: '#313244',
    marginVertical: 14,
  },

  version: {
    position: 'absolute',
    bottom: 36,
    fontSize: 11,
    color: '#45475a',
    letterSpacing: 2,
  },
});