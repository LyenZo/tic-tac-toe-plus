import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function PantallaCpu() {
  // Estado para el tablero: un array de 9 posiciones inicialmente vacías (null)
  const [board, setBoard] = useState(Array(9).fill(null));
  // Estado para saber de quién es el turno (True = Jugador ❌, False = CPU ⭕)
  const [isXNext, setIsXNext] = useState(true);
  // Estado para llevar el conteo de victorias
  const [wins, setWins] = useState({ '❌': 0, '⭕': 0 });

  // Función para verificar si hay un ganador
  const calcularGanador = (cuadrados) => {
    const lineasGanadoras = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
      [0, 4, 8], [2, 4, 6]             // Diagonales
    ];

    for (let i = 0; i < lineasGanadoras.length; i++) {
      const [a, b, c] = lineasGanadoras[i];
      if (cuadrados[a] && cuadrados[a] === cuadrados[b] && cuadrados[a] === cuadrados[c]) {
        return cuadrados[a]; // Retorna '❌' o '⭕'
      }
    }
    return null;
  };

  const ganador = calcularGanador(board);
  // Evaluamos si el tablero está lleno para activar la fase de Muerte Súbita
  const esTableroLleno = board.every((cuadrado) => cuadrado !== null);

  // 🔥 NUEVO: Efecto que controla el turno automatizado de la CPU
  useEffect(() => {
    // Si no es turno de X (le toca a la CPU) y nadie ha ganado, la CPU juega
    if (!isXNext && !ganador) {
      const timer = setTimeout(() => {
        hacerMovimientoCpu();
      }, 600); // 600 milisegundos de retraso para simular "pensamiento"

      return () => clearTimeout(timer);
    }
  }, [isXNext, ganador]);

  // 🔥 NUEVO: Lógica de decisión de la CPU
  const hacerMovimientoCpu = () => {
    const nuevoTablero = [...board];
    let opcionesValidas = [];

    if (esTableroLleno) {
      // Muerte Súbita: La CPU escanea el tablero buscando fichas tuyas ('❌') para robarlas
      board.forEach((celda, idx) => {
        if (celda === '❌') opcionesValidas.push(idx);
      });
    } else {
      // Fase Normal: La CPU busca cualquier casilla vacía disponible
      board.forEach((celda, idx) => {
        if (celda === null) opcionesValidas.push(idx);
      });
    }

    // Si por alguna razón no hay movimientos posibles, frena la ejecución
    if (opcionesValidas.length === 0) return;

    // Selecciona una opción al azar de la lista filtrada de movimientos válidos
    const indiceAleatorio = opcionesValidas[Math.floor(Math.random() * opcionesValidas.length)];
    
    nuevoTablero[indiceAleatorio] = '⭕'; // La CPU coloca su pieza

    setBoard(nuevoTablero);
    setIsXNext(true); // Le devuelve el turno al jugador

    // Verifica si la CPU ganó con este movimiento
    const nuevoGanador = calcularGanador(nuevoTablero);
    if (nuevoGanador) {
      setWins((prevWins) => ({
        ...prevWins,
        [nuevoGanador]: prevWins[nuevoGanador] + 1
      }));
    }
  };

  // Manejar el clic del Jugador Humano
  const handlePress = (index) => {
    // MODIFICADO: Bloquea los clics si ya hay ganador o si es el turno de la CPU (!isXNext)
    if (ganador || !isXNext) return;

    const jugadorActual = '❌';
    const oponente = '⭕';
    const nuevoTablero = [...board];

    // LÓGICA DE MUERTE SÚBITA
    if (esTableroLleno) {
      // El jugador debe seleccionar obligatoriamente una pieza de la CPU para robarla
      if (board[index] !== oponente) return;
      nuevoTablero[index] = jugadorActual;
    } else {
      // Fase normal: Solo casillas vacías
      if (board[index] !== null) return;
      nuevoTablero[index] = jugadorActual;
    }

    setBoard(nuevoTablero);
    setIsXNext(false); // Cede el turno a la CPU

    // Verificamos si el jugador ganó con su movimiento
    const nuevoGanador = calcularGanador(nuevoTablero);
    if (nuevoGanador) {
      setWins((prevWins) => ({
        ...prevWins,
        [nuevoGanador]: prevWins[nuevoGanador] + 1
      }));
    }
  };

  // Reiniciar el juego
  const reiniciarJuego = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true); // El jugador humano siempre inicia la nueva ronda
  };

  // Renderizar un cuadro individual
  const renderCuadro = (index) => {
    // MODIFICADO: El jugador Humano solo puede robar si es SU turno (isXNext) y la pieza es de la CPU ('⭕')
    const esRobable = esTableroLleno && !ganador && isXNext && board[index] === '⭕';

    return (
      <Pressable 
        style={[
          styles.cuadro,
          esRobable && styles.cuadroRobable // Brilla en rosa si el jugador humano la puede robar
        ]} 
        onPress={() => handlePress(index)}
      >
        <Text style={styles.textoCuadro}>{board[index]}</Text>
      </Pressable>
    );
  };

  // MODIFICADO: Textos adaptados para la experiencia contra la Inteligencia Artificial
  let estadoTexto = isXNext ? '👉 Tu Turno (❌)' : '⏳ CPU pensando...';
  if (ganador) {
    estadoTexto = ganador === '❌' ? '¡Le ganaste a la CPU! 🎉' : 'La CPU te ha derrotado 🤖';
  } else if (esTableroLleno) {
    estadoTexto = isXNext 
      ? '🔥 ¡Muerte Súbita! ¡Roba una pieza de la CPU!' 
      : '⏳ Muerte Súbita: La CPU está eligiendo qué pieza robarte...';
  }

  return (
    <View style={styles.container}>
      
      {/* Marcador */}
      <View style={styles.scoreboard}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>Tú (❌): {wins['❌']}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>CPU (⭕): {wins['⭕']}</Text>
        </View>
      </View>

      <Text style={styles.status}>{estadoTexto}</Text>

      {/* Tablero de 3x3 */}
      <View style={styles.tablero}>
        <View style={styles.fila}>
          {renderCuadro(0)}
          {renderCuadro(1)}
          {renderCuadro(2)}
        </View>
        <View style={styles.fila}>
          {renderCuadro(3)}
          {renderCuadro(4)}
          {renderCuadro(5)}
        </View>
        <View style={styles.fila}>
          {renderCuadro(6)}
          {renderCuadro(7)}
          {renderCuadro(8)}
        </View>
      </View>

      {/* Botones de control */}
      <View style={styles.areaBotones}>
        <Pressable style={styles.buttonReset} onPress={reiniciarJuego}>
          <Text style={styles.buttonText}>Reiniciar</Text>
        </Pressable>

        <Link href="/" asChild>
          <Pressable style={styles.buttonBack}>
            <Text style={styles.buttonText}>Menú Principal</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

// Mantenemos exactamente tus mismos estilos visuales
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e2e', alignItems: 'center', justifyContent: 'center' },
  scoreboard: { flexDirection: 'row', gap: 20, marginBottom: 15 },
  scoreBox: { backgroundColor: '#313244', paddingVertical: 10, paddingHorizontal: 22, borderRadius: 12, minWidth: 110, alignItems: 'center' },
  scoreText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
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