import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { io } from 'socket.io-client';

const SERVIDOR_URL = 'https://tic-tac-toe-server-tat4.onrender.com';

export default function PantallaOnline() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [estado, setEstado] = useState('menu');
  const [miFicha, setMiFicha] = useState(null);
  const [turnoDe, setTurnoDe] = useState('❌');
  const [idSala, setIdSala] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [wins, setWins] = useState({ '❌': 0, '⭕': 0 });
  const [serieGanador, setSerieGanador] = useState(null);
  const [ganadorRonda, setGanadorRonda] = useState(null);
  const [esperandoRival, setEsperandoRival] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SERVIDOR_URL, {
      transports: ['websocket'],
      forceNew: true,
      timeout: 5000
    });

    socketRef.current.on('connect', () => setConectado(true));
    socketRef.current.on('disconnect', () => { setConectado(false); setEstado('menu'); });
    socketRef.current.on('connect_error', () => setConectado(false));

    socketRef.current.on('esperandoOponente', () => setEstado('buscando'));

    socketRef.current.on('partidaIniciada', ({ idSala, miFicha, turnoDe }) => {
      setIdSala(idSala);
      setMiFicha(miFicha);
      setTurnoDe(turnoDe);
      setBoard(Array(9).fill(null));
      setWins({ '❌': 0, '⭕': 0 });
      setSerieGanador(null);
      setGanadorRonda(null);
      setEsperandoRival(false);
      setEstado('jugando');
    });

    socketRef.current.on('tableroActualizado', ({ nuevoTablero, siguienteTurno }) => {
      setBoard(nuevoTablero);
      setTurnoDe(siguienteTurno);
    });

    socketRef.current.on('resultadoRonda', ({ wins }) => {
      setWins(wins);
    });

    socketRef.current.on('serieTerminada', ({ ganador, wins }) => {
      setWins(wins);
      setSerieGanador(ganador);
    });

    socketRef.current.on('nuevaRonda', ({ turnoDe }) => {
      setBoard(Array(9).fill(null));
      setTurnoDe(turnoDe);
      setGanadorRonda(null);
      setEsperandoRival(false);
    });

    socketRef.current.on('oponenteDesconectado', () => {
      setEstado('menu');
      alert('⚠️ Tu oponente se ha desconectado.');
    });

    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  const buscarPartida = () => {
    if (!conectado) {
      alert('⚠️ No hay conexión con el servidor.');
      return;
    }
    if (socketRef.current) socketRef.current.emit('buscarPartida');
  };

  const calcularGanador = (cuadrados) => {
    const lineas = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lineas.length; i++) {
      const [a, b, c] = lineas[i];
      if (cuadrados[a] && cuadrados[a] === cuadrados[b] && cuadrados[a] === cuadrados[c]) {
        return cuadrados[a];
      }
    }
    return null;
  };

  const ganador = calcularGanador(board);
  const esTableroLleno = board.every((q) => q !== null);
  const esEmpate = !ganador && esTableroLleno;

  useEffect(() => {
    if (ganador && ganador !== ganadorRonda) {
      setGanadorRonda(ganador);
      socketRef.current.emit('reportarGanador', { idSala, ganador });
    }
  }, [ganador]);

  const confirmarSiguienteRonda = () => {
    setEsperandoRival(true);
    socketRef.current.emit('listo', { idSala });
  };

  const handlePress = (index) => {
    if (ganador || turnoDe !== miFicha || serieGanador) return;

    const oponente = miFicha === '❌' ? '⭕' : '❌';
    const nuevoTablero = [...board];

    if (esTableroLleno) {
      if (board[index] !== oponente) return;
      nuevoTablero[index] = miFicha;
    } else {
      if (board[index] !== null) return;
      nuevoTablero[index] = miFicha;
    }

    const siguienteTurno = miFicha === '❌' ? '⭕' : '❌';
    setBoard(nuevoTablero);
    setTurnoDe(siguienteTurno);
    socketRef.current.emit('hacerMovimiento', { idSala, nuevoTablero, siguienteTurno });
  };

  const renderCuadro = (index) => {
    const oponente = miFicha === '❌' ? '⭕' : '❌';
    const esRobable = esTableroLleno && !ganador && turnoDe === miFicha && board[index] === oponente;
    return (
      <Pressable
        style={[styles.cuadro, esRobable && styles.cuadroRobable]}
        onPress={() => handlePress(index)}
      >
        <Text style={styles.textoCuadro}>{board[index]}</Text>
      </Pressable>
    );
  };

  if (estado === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Modo Online</Text>
        <Text style={[styles.conexionTexto, conectado ? styles.conectado : styles.desconectado]}>
          {conectado ? '🟢 Servidor Listo' : '🔴 Buscando Servidor...'}
        </Text>
        <Pressable style={styles.buttonBuscar} onPress={buscarPartida}>
          <Text style={styles.buttonText}>Buscar Oponente 🔍</Text>
        </Pressable>
        <Link href="/" asChild>
          <Pressable style={styles.buttonBack}><Text style={styles.buttonText}>Volver</Text></Pressable>
        </Link>
      </View>
    );
  }

  if (estado === 'buscando') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#cba6f7" />
        <Text style={styles.status}>Buscando un rival digno...</Text>
        <Text style={styles.subtitle}>Abre otra pestaña en la PC para jugar contra ti mismo</Text>
      </View>
    );
  }

  let infoTexto = turnoDe === miFicha ? '👉 ¡Es tu turno!' : '⏳ Esperando movimiento rival...';
  if (serieGanador) {
    infoTexto = serieGanador === miFicha ? '🏆 ¡Ganaste la serie!' : '💀 Perdiste la serie';
  } else if (ganador) {
    infoTexto = ganador === miFicha ? '¡Ganaste la ronda! 🎉' : 'Perdiste la ronda 😢';
  } else if (esEmpate) {
    infoTexto = turnoDe === miFicha
      ? '🔥 ¡Muerte Súbita! ¡Roba una pieza rival!'
      : '🔥 ¡Muerte Súbita! Esperando rival...';
  }

  return (
    <View style={styles.container}>

      <Text style={styles.serieLabel}>Al mejor de 3</Text>

      <View style={styles.scoreboard}>
        <View style={[styles.scoreBox, wins['❌'] > wins['⭕'] && styles.scoreBoxLeading]}>
          <Text style={styles.scoreLabel}>{miFicha === '❌' ? 'Tú' : 'Rival'}</Text>
          <Text style={styles.scoreEmoji}>❌</Text>
          <View style={styles.puntosRow}>
            {[0, 1].map((i) => (
              <View key={i} style={[styles.punto, wins['❌'] > i && styles.puntoActivoX]} />
            ))}
          </View>
          <Text style={styles.scoreNum}>{wins['❌']}</Text>
        </View>

        <View style={styles.scoreVs}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={[styles.scoreBox, wins['⭕'] > wins['❌'] && styles.scoreBoxLeading]}>
          <Text style={styles.scoreLabel}>{miFicha === '⭕' ? 'Tú' : 'Rival'}</Text>
          <Text style={styles.scoreEmoji}>⭕</Text>
          <View style={styles.puntosRow}>
            {[0, 1].map((i) => (
              <View key={i} style={[styles.punto, wins['⭕'] > i && styles.puntoActivoO]} />
            ))}
          </View>
          <Text style={styles.scoreNum}>{wins['⭕']}</Text>
        </View>
      </View>

      <Text style={styles.rolText}>Eres: {miFicha}</Text>
      <Text style={styles.status}>{infoTexto}</Text>

      <View style={styles.tablero}>
        <View style={styles.fila}>{renderCuadro(0)}{renderCuadro(1)}{renderCuadro(2)}</View>
        <View style={styles.fila}>{renderCuadro(3)}{renderCuadro(4)}{renderCuadro(5)}</View>
        <View style={styles.fila}>{renderCuadro(6)}{renderCuadro(7)}{renderCuadro(8)}</View>
      </View>

      {serieGanador ? (
        <Link href="/" asChild>
          <Pressable style={styles.buttonBuscar}>
            <Text style={styles.buttonText}>Volver al Menú</Text>
          </Pressable>
        </Link>
      ) : ganador && !esperandoRival ? (
        <Pressable style={styles.buttonBuscar} onPress={confirmarSiguienteRonda}>
          <Text style={styles.buttonText}>Siguiente Ronda ▶</Text>
        </Pressable>
      ) : ganador && esperandoRival ? (
        <View style={styles.esperandoBox}>
          <ActivityIndicator size="small" color="#cba6f7" />
          <Text style={styles.esperandoTexto}>Esperando al rival...</Text>
        </View>
      ) : (
        <Link href="/" asChild>
          <Pressable style={styles.buttonBack}><Text style={styles.buttonText}>Salir al Menú</Text></Pressable>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e2e', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 5 },
  conexionTexto: { fontSize: 14, fontWeight: 'bold', marginBottom: 30 },
  conectado: { color: '#a6e3a1' },
  desconectado: { color: '#f38ba8' },
  serieLabel: { color: '#cdd6f4', fontSize: 13, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, opacity: 0.7 },
  scoreboard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  scoreBox: { backgroundColor: '#313244', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center', minWidth: 100, borderWidth: 2, borderColor: 'transparent' },
  scoreBoxLeading: { borderColor: '#cba6f7' },
  scoreLabel: { color: '#cdd6f4', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, marginBottom: 2 },
  scoreEmoji: { fontSize: 28, marginBottom: 8 },
  puntosRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  punto: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#45475a' },
  puntoActivoX: { backgroundColor: '#89b4fa' },
  puntoActivoO: { backgroundColor: '#fab387' },
  scoreNum: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  scoreVs: { alignItems: 'center' },
  vsText: { color: '#6c7086', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  status: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 20, marginTop: 20, textAlign: 'center', paddingHorizontal: 20 },
  subtitle: { fontSize: 14, color: '#a6adc8', textAlign: 'center' },
  rolText: { fontSize: 18, color: '#cba6f7', fontWeight: 'bold', marginBottom: 5 },
  tablero: { backgroundColor: '#313244', padding: 10, borderRadius: 16, marginBottom: 30 },
  fila: { flexDirection: 'row' },
  cuadro: { width: 90, height: 90, backgroundColor: '#181825', margin: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  cuadroRobable: { borderColor: '#f38ba8', backgroundColor: '#2a1f2d' },
  textoCuadro: { fontSize: 36 },
  buttonBuscar: { backgroundColor: '#a6e3a1', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, marginBottom: 15, width: 220, alignItems: 'center' },
  buttonBack: { backgroundColor: '#f38ba8', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, width: 220, alignItems: 'center' },
  buttonText: { color: '#11111b', fontSize: 16, fontWeight: 'bold' },
  esperandoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#313244', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  esperandoTexto: { color: '#cdd6f4', fontSize: 15, fontWeight: '600' },
});