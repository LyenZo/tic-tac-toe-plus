import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Link } from 'expo-router';
import { io } from 'socket.io-client';


const SERVIDOR_URL = 'http://192.168.100.100:3000';

export default function PantallaOnline() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [estado, setEstado] = useState('menu'); // 'menu', 'buscando', 'jugando'
  const [miFicha, setMiFicha] = useState(null); // '❌' o '⭕'
  const [turnoDe, setTurnoDe] = useState('❌'); // De quién es el turno actual
  const [idSala, setIdSala] = useState(null);
  const [conectado, setConectado] = useState(false); // Estado para saber si el server responde
  
  // NUEVO: Estado para almacenar las victorias acumuladas en la sesión online
  const [wins, setWins] = useState({ '❌': 0, '⭕': 0 });
  // NUEVO: Auxiliar para evitar que un mismo punto se cuente dos veces por los eventos de red
  const [ultimoGanadorContado, setUltimoGanadorContado] = useState(null);

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
  // NUEVO: Detecta si el tablero está lleno para activar la fase de sustitución
  const esTableroLleno = board.every((q) => q !== null);
  const esEmpate = !ganador && esTableroLleno;

  // NUEVO: Escucha automatizada para actualizar el marcador global de forma segura
  useEffect(() => {
    if (ganador && ganador !== ultimoGanadorContado) {
      setWins((prev) => ({ ...prev, [ganador]: prev[ganador] + 1 }));
      setUltimoGanadorContado(ganador);
    } else if (!ganador) {
      setUltimoGanadorContado(null); // Resetea el candado cuando inicia una nueva ronda
    }
  }, [ganador]);

  const handlePress = (index) => {
    // NUEVO: Ajuste de validación para permitir clicks durante la muerte súbita
    if (ganador || turnoDe !== miFicha) return;

    const oponente = miFicha === '❌' ? '⭕' : '❌';
    const nuevoTablero = [...board];

    // NUEVA LÓGICA ONLINE "SIN EMPATES":
    if (esTableroLleno) {
      // En Muerte Súbita, tu click obligatoriamente debe ser sobre una pieza del rival para robarla
      if (board[index] !== oponente) return;
      nuevoTablero[index] = miFicha;
    } else {
      // En juego normal, solo puedes interactuar con casillas completamente vacías
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
    // NUEVO: Determina si la casilla es actualmente robable por el jugador local
    const esRobable = esTableroLleno && !ganador && turnoDe === miFicha && board[index] === oponente;

    return (
      <Pressable 
        style={[
          styles.cuadro,
          esRobable && styles.cuadroRobable // Aplica el borde rosa de advertencia si puedes robarla
        ]} 
        onPress={() => handlePress(index)}
      >
        <Text style={styles.textoCuadro}>{board[index]}</Text>
      </Pressable>
    );
  };

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
  
  // NUEVO: Sobreescribe el texto si el juego entra en fase de Muerte Súbita
  if (esEmpate) {
    infoTexto = turnoDe === miFicha 
      ? '🔥 ¡Muerte Súbita! ¡Roba una pieza rival!' 
      : '🔥 ¡Muerte Súbita! Esperando rival...';
  }

  return (
    <View style={styles.container}>
      
      {/* NUEVO: Interfaz de Marcador en la parte superior */}
      <View style={styles.scoreboard}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>❌: {wins['❌']}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>⭕: {wins['⭕']}</Text>
        </View>
      </View>

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
  cuadro: { width: 90, height: 90, backgroundColor: '#181825', margin: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  
  // NUEVO: Resalta las fichas enemigas que puedes robar cuando es tu turno en Muerte Súbita
  cuadroRobable: { borderColor: '#f38ba8', backgroundColor: '#2a1f2d' },
  
  // NUEVO: Estilos estéticos agregados para el marcador de puntuación
  scoreboard: { flexDirection: 'row', gap: 20, marginBottom: 15 },
  scoreBox: { backgroundColor: '#313244', paddingVertical: 10, paddingHorizontal: 22, borderRadius: 12, minWidth: 90, alignItems: 'center' },
  scoreText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  
  textoCuadro: { fontSize: 36 },
  buttonBuscar: { backgroundColor: '#a6e3a1', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, marginBottom: 15, width: 220, alignItems: 'center' },
  buttonBack: { backgroundColor: '#f38ba8', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, width: 220, alignItems: 'center' },
  buttonText: { color: '#11111b', fontSize: 16, fontWeight: 'bold' }
});