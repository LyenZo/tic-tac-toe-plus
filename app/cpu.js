import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function PantallaCpu() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [wins, setWins] = useState({ '❌': 0, '⭕': 0 });
  const [serieGanador, setSerieGanador] = useState(null);

  const calcularGanador = (cuadrados) => {
    const lineasGanadoras = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lineasGanadoras.length; i++) {
      const [a, b, c] = lineasGanadoras[i];
      if (cuadrados[a] && cuadrados[a] === cuadrados[b] && cuadrados[a] === cuadrados[c]) {
        return cuadrados[a];
      }
    }
    return null;
  };

  const ganador = calcularGanador(board);
  const esTableroLleno = board.every((cuadrado) => cuadrado !== null);

  useEffect(() => {
    if (!isXNext && !ganador && !serieGanador) {
      const timer = setTimeout(() => {
        hacerMovimientoCpu();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, ganador, serieGanador]);

  const registrarVictoria = (simbolo, nuevoTablero) => {
    const nuevoGanador = calcularGanador(nuevoTablero);
    if (!nuevoGanador) return;

    const nuevasWins = {
      ...wins,
      [nuevoGanador]: wins[nuevoGanador] + 1,
    };
    setWins(nuevasWins);

    if (nuevasWins[nuevoGanador] >= 2) {
      setSerieGanador(nuevoGanador);
    }
  };

  const hacerMovimientoCpu = () => {
    const nuevoTablero = [...board];
    let opcionesValidas = [];

    if (esTableroLleno) {
      board.forEach((celda, idx) => {
        if (celda === '❌') opcionesValidas.push(idx);
      });
    } else {
      board.forEach((celda, idx) => {
        if (celda === null) opcionesValidas.push(idx);
      });
    }

    if (opcionesValidas.length === 0) return;

    const indiceAleatorio = opcionesValidas[Math.floor(Math.random() * opcionesValidas.length)];
    nuevoTablero[indiceAleatorio] = '⭕';

    setBoard(nuevoTablero);
    setIsXNext(true);
    registrarVictoria('⭕', nuevoTablero);
  };

  const handlePress = (index) => {
    if (ganador || !isXNext || serieGanador) return;

    const jugadorActual = '❌';
    const oponente = '⭕';
    const nuevoTablero = [...board];

    if (esTableroLleno) {
      if (board[index] !== oponente) return;
      nuevoTablero[index] = jugadorActual;
    } else {
      if (board[index] !== null) return;
      nuevoTablero[index] = jugadorActual;
    }

    setBoard(nuevoTablero);
    setIsXNext(false);
    registrarVictoria('❌', nuevoTablero);
  };

  const reiniciarRonda = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const reiniciarSerie = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWins({ '❌': 0, '⭕': 0 });
    setSerieGanador(null);
  };

  const renderCuadro = (index) => {
    const esRobable = esTableroLleno && !ganador && isXNext && board[index] === '⭕';
    return (
      <Pressable
        style={[styles.cuadro, esRobable && styles.cuadroRobable]}
        onPress={() => handlePress(index)}
      >
        <Text style={styles.textoCuadro}>{board[index]}</Text>
      </Pressable>
    );
  };

  let estadoTexto = isXNext ? '👉 Tu Turno (❌)' : '⏳ CPU pensando...';
  if (serieGanador) {
    estadoTexto = serieGanador === '❌' ? '🏆 ¡Ganaste la serie!' : '💀 La CPU ganó la serie';
  } else if (ganador) {
    estadoTexto = ganador === '❌' ? '¡Le ganaste a la CPU! 🎉' : 'La CPU te ha derrotado 🤖';
  } else if (esTableroLleno) {
    estadoTexto = isXNext
      ? '🔥 ¡Muerte Súbita! ¡Roba una pieza de la CPU!'
      : '⏳ Muerte Súbita: La CPU está eligiendo qué pieza robarte...';
  }

  return (
    <View style={styles.container}>

      <Text style={styles.serieLabel}>Al mejor de 3</Text>

      <View style={styles.scoreboard}>
        <View style={[styles.scoreBox, wins['❌'] > wins['⭕'] && styles.scoreBoxLeading]}>
          <Text style={styles.scoreLabel}>Tú</Text>
          <Text style={styles.scoreEmoji}>❌</Text>
          <View style={styles.puntosRow}>
            {[0, 1].map((i) => (
              <View
                key={i}
                style={[styles.punto, wins['❌'] > i && styles.puntoActivo]}
              />
            ))}
          </View>
          <Text style={styles.scoreNum}>{wins['❌']}</Text>
        </View>

        <View style={styles.scoreVs}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={[styles.scoreBox, wins['⭕'] > wins['❌'] && styles.scoreBoxLeading]}>
          <Text style={styles.scoreLabel}>CPU</Text>
          <Text style={styles.scoreEmoji}>⭕</Text>
          <View style={styles.puntosRow}>
            {[0, 1].map((i) => (
              <View
                key={i}
                style={[styles.punto, wins['⭕'] > i && styles.puntoActivoCpu]}
              />
            ))}
          </View>
          <Text style={styles.scoreNum}>{wins['⭕']}</Text>
        </View>
      </View>

      <Text style={styles.status}>{estadoTexto}</Text>

      <View style={styles.tablero}>
        <View style={styles.fila}>{renderCuadro(0)}{renderCuadro(1)}{renderCuadro(2)}</View>
        <View style={styles.fila}>{renderCuadro(3)}{renderCuadro(4)}{renderCuadro(5)}</View>
        <View style={styles.fila}>{renderCuadro(6)}{renderCuadro(7)}{renderCuadro(8)}</View>
      </View>

      <View style={styles.areaBotones}>
        {!serieGanador ? (
          <Pressable style={styles.buttonReset} onPress={reiniciarRonda}>
            <Text style={styles.buttonText}>Reiniciar Ronda</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.buttonReset} onPress={reiniciarSerie}>
            <Text style={styles.buttonText}>Nueva Serie</Text>
          </Pressable>
        )}
        <Link href="/" asChild>
          <Pressable style={styles.buttonBack}>
            <Text style={styles.buttonText}>Menú Principal</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e2e', alignItems: 'center', justifyContent: 'center' },
  serieLabel: { color: '#cdd6f4', fontSize: 13, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, opacity: 0.7 },
  scoreboard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  scoreBox: { backgroundColor: '#313244', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center', minWidth: 100, borderWidth: 2, borderColor: 'transparent' },
  scoreBoxLeading: { borderColor: '#a6e3a1' },
  scoreLabel: { color: '#cdd6f4', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, marginBottom: 2 },
  scoreEmoji: { fontSize: 28, marginBottom: 8 },
  puntosRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  punto: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#45475a' },
  puntoActivo: { backgroundColor: '#a6e3a1' },
  puntoActivoCpu: { backgroundColor: '#f38ba8' },
  scoreNum: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  scoreVs: { alignItems: 'center' },
  vsText: { color: '#6c7086', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  status: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 30, textAlign: 'center', paddingHorizontal: 20 },
  tablero: { backgroundColor: '#313244', padding: 10, borderRadius: 16, marginBottom: 30 },
  fila: { flexDirection: 'row' },
  cuadro: { width: 90, height: 90, backgroundColor: '#181825', margin: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  cuadroRobable: { borderColor: '#f38ba8', backgroundColor: '#2a1f2d' },
  textoCuadro: { fontSize: 36 },
  areaBotones: { flexDirection: 'row', gap: 15 },
  buttonReset: { backgroundColor: '#a6e3a1', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
  buttonBack: { backgroundColor: '#f38ba8', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
  buttonText: { color: '#11111b', fontSize: 16, fontWeight: 'bold' },
});