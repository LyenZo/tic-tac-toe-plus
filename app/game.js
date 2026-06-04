import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function PantallaJuego() {
  // Estado para el tablero: un array de 9 posiciones inicialmente vacías (null)
  const [board, setBoard] = useState(Array(9).fill(null));
  // Estado para saber de quién es el turno (True = X, False = O)
  const [isXNext, setIsXNext] = useState(true);
  // Estado para llevar el conteo de victorias de cada jugador
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
        return cuadrados[a]; // Retorna 'X' o 'O'
      }
    }
    return null;
  };

  const ganador = calcularGanador(board);
  // Evaluamos si el tablero está lleno para activar la fase de Muerte Súbita
  const esTableroLleno = board.every((cuadrado) => cuadrado !== null);

  // Manejar el clic en un cuadro
  const handlePress = (index) => {
    // Si ya hay un ganador, no hacemos nada
    if (ganador) return;

    const jugadorActual = isXNext ? '❌' : '⭕';
    const oponente = isXNext ? '⭕' : '❌';
    const nuevoTablero = [...board];

    // LÓGICA DE MUERTE SÚBITA
    if (esTableroLleno) {
      // Si el tablero está lleno, obligatoriamente debes elegir una pieza del rival para robarla
      if (board[index] !== oponente) return;
      nuevoTablero[index] = jugadorActual;
    } else {
      // Si el juego está en fase normal, solo puedes presionar casillas vacías
      if (board[index] !== null) return;
      nuevoTablero[index] = jugadorActual;
    }

    setBoard(nuevoTablero);
    setIsXNext(!isXNext); // Cambiar turno

    // Verificamos si el robo o movimiento generó un ganador al instante
    const nuevoGanador = calcularGanador(nuevoTablero);
    if (nuevoGanador) {
      setWins((prevWins) => ({
        ...prevWins,
        [nuevoGanador]: prevWins[nuevoGanador] + 1
      }));
    }
  };

  // Reiniciar el juego (Limpia el tablero manteniendo el marcador intacto)
  const reiniciarJuego = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  // Renderizar un cuadro individual
  const renderCuadro = (index) => {
    const oponente = isXNext ? '⭕' : '❌';
    // Una casilla es robable si estamos en muerte súbita, no hay ganador, y le pertenece al rival
    const esRobable = esTableroLleno && !ganador && board[index] === oponente;

    return (
      <Pressable 
        style={[
          styles.cuadro,
          esRobable && styles.cuadroRobable // Aplica estilo especial si se puede robar
        ]} 
        onPress={() => handlePress(index)}
      >
        <Text style={styles.textoCuadro}>{board[index]}</Text>
      </Pressable>
    );
  };

  // Texto del estado actual del juego
  let estadoTexto = `Turno de: ${isXNext ? '❌' : '⭕'}`;
  if (ganador) {
    estadoTexto = `¡Ganador: ${ganador}! 🎉`;
  } else if (esTableroLleno) {
    estadoTexto = `🔥 ¡Muerte Súbita! ${isXNext ? '❌' : '⭕'}: ¡Roba una pieza rival!`;
  }

  return (
    <View style={styles.container}>
      
      {/* Interfaz del Marcador de Jugadores */}
      <View style={styles.scoreboard}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>❌: {wins['❌']}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>⭕: {wins['⭕']}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreboard: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  scoreBox: {
    backgroundColor: '#313244',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tablero: {
    backgroundColor: '#313244',
    padding: 10,
    borderRadius: 16,
    marginBottom: 30,
  },
  fila: {
    flexDirection: 'row',
  },
  cuadro: {
    width: 90,
    height: 90,
    backgroundColor: '#181825',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  // NUEVO: Destaca visualmente las fichas enemigas que puedes sustituir
  cuadroRobable: {
    borderColor: '#f38ba8', 
    backgroundColor: '#2a1f2d',
  },
  textoCuadro: {
    fontSize: 36,
  },
  areaBotones: {
    flexDirection: 'row',
    gap: 15,
  },
  buttonReset: {
    backgroundColor: '#a6e3a1', 
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  buttonBack: {
    backgroundColor: '#f38ba8', 
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  buttonText: {
    color: '#11111b',
    fontSize: 16,
    fontWeight: 'bold',
  },
});