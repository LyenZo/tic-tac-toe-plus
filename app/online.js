import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Link } from 'expo-router';
import { io } from 'socket.io-client';

// ⚠️ MODIFICA ESTO: Cambia 'localhost' por la IP de tu PC Fedora (ej. 'http://192.168.1.15:3000')
// Si dejas 'localhost', el botón seguirá pareciendo "muerto" en el celular.
const SERVIDOR_URL = 'http://192.168.100.100:3000';

export default function PantallaOnline() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [estado, setEstado] = useState('menu'); // 'menu', 'buscando', 'jugando'
  const [miFicha, setMiFicha] = useState(null); // '❌' o '⭕'
  const [turnoDe, setTurnoDe] = useState('❌'); // De quién es el turno actual
  const [idSala, setIdSala] = useState(null);
  const [conectado, setConectado] = useState(false); // Estado para saber si el server responde

  const socketRef = useRef(null);

  useEffect(() => {
    // Inicializar la conexión con configuraciones nativas para móvil
    socketRef.current = io(SERVIDOR_URL, {
      transports: ['websocket'], // Obliga a usar WebSockets directos en el celular
      forceNew: true,
      timeout: 5000 // Si en 5 segundos no conecta, aborta
    });

    // Detectar si logramos abrazar al servidor con éxito
    socketRef.current.on('connect', () => {
      setConectado(true);
    });

    socketRef.current.on('disconnect', () => {
      setConectado(false);
      setEstado('menu');
    });

    socketRef.current.on('connect_error', () => {
      setConectado(false);
    });

    // Escuchar cuando el servidor nos pone en cola
    socketRef.current.on('esperandoOponente', () => {
      setEstado('buscando');
    });

    // Escuchar cuando se empareja la partida
    socketRef.current.on('partidaIniciada', ({ idSala, miFicha, turnoDe }) => {
      setIdSala(idSala);
      setMiFicha(miFicha);
      setTurnoDe(turnoDe);
      setBoard(Array(9).fill(null));
      setEstado('jugando');
    });

    // Escuchar los movimientos del rival
    socketRef.current.on('tableroActualizado', ({ nuevoTablero, siguienteTurno }) => {
      setBoard(nuevoTablero);
      setTurnoDe(siguienteTurno);
    });

    // Limpiar conexión al salir de la pantalla
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const buscarPartida = () => {
    if (!conectado) {
      // Si el botón no puede comunicarse, te avisa inmediatamente en lugar de quedarse "muerto"
      alert('⚠️ No hay conexión con el servidor.\n\nRecuerda poner la IP de tu computadora en el código y abrir el firewall de Fedora.');
      return;
    }

    if (socketRef.current) {
      socketRef.current.emit('buscarPartida');
    }
  };

  // Lógica para verificar ganador
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
  const esEmpate = !ganador && board.every((q) => q !== null);

  const handlePress = (index) => {
    if (board[index] || ganador || turnoDe !== miFicha) return;

    const nuevoTablero = [...board];
    nuevoTablero[index] = miFicha;
    const siguienteTurno = miFicha === '❌' ? '⭕' : '❌';

    setBoard(nuevoTablero);
    setTurnoDe(siguienteTurno);

    socketRef.current.emit('hacerMovimiento', { idSala, nuevoTablero, siguienteTurno });
  };

  const renderCuadro = (index) => (
    <Pressable style={styles.cuadro} onPress={() => handlePress(index)}>
      <Text style={styles.textoCuadro}>{board[index]}</Text>
    </Pressable>
  );

  // --- RENDERS CONDICIONALES ---

  if (estado === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Modo Online</Text>
        
        {/* Indicador visual en pantalla para saber el estado de la red antes de presionar */}
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
  if (ganador) infoTexto = ganador === miFicha ? '¡Ganaste! 🎉' : 'Perdiste 😢';
  if (esEmpate) infoTexto = '¡Empate técnico! 🤝';

  return (
    <View style={styles.container}>
      <Text style={styles.rolText}>Eres: {miFicha}</Text>
      <Text style={styles.status}>{infoTexto}</Text>

      <View style={styles.tablero}>
        <View style={styles.fila}>{renderCuadro(0)}{renderCuadro(1)}{renderCuadro(2)}</View>
        <View style={styles.fila}>{renderCuadro(3)}{renderCuadro(4)}{renderCuadro(5)}</View>
        <View style={styles.fila}>{renderCuadro(6)}{renderCuadro(7)}{renderCuadro(8)}</View>
      </View>

      <Link href="/" asChild>
        <Pressable style={styles.buttonBack}><Text style={styles.buttonText}>Salir al Menú</Text></Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e2e', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 5 },
  conexionTexto: { fontSize: 14, fontWeight: 'bold', marginBottom: 30 },
  conectado: { color: '#a6e3a1' },
  desconectado: { color: '#f38ba8' },
  status: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 20, marginTop: 20, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#a6adc8', textAlign: 'center' },
  rolText: { fontSize: 18, color: '#cba6f7', fontWeight: 'bold', marginBottom: 5 },
  tablero: { backgroundColor: '#313244', padding: 10, borderRadius: 16, marginBottom: 30 },
  fila: { flexDirection: 'row' },
  cuadro: { width: 90, height: 90, backgroundColor: '#181825', margin: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  textoCuadro: { fontSize: 36 },
  buttonBuscar: { backgroundColor: '#a6e3a1', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, marginBottom: 15, width: 220, alignItems: 'center' },
  buttonBack: { backgroundColor: '#f38ba8', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, width: 220, alignItems: 'center' },
  buttonText: { color: '#11111b', fontSize: 16, fontWeight: 'bold' }
});