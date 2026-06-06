# ❌ Tic-Tac-Toe Plus ⭕

¡Bienvenido a **Tic-Tac-Toe Plus**! Una versión moderna, móvil y vitaminada del clásico juego de Gato (Tres en Raya). Este proyecto cuenta con un sistema de juego clásico, un modo contra la Inteligencia Artificial local y una modalidad competitiva multijugador en tiempo real basada en WebSockets, complementada con una mecánica única de juego tardío.

---

## 🚀 Características Principales

* **Modo Contra la CPU 🤖:** Enfréntate a una IA local adaptada con tiempos de reacción realistas y soporte para la regla especial.
* **Modo Multijugador Real-Time ⚡:** Conéctate con jugadores en tiempo real gracias a la integración de un servidor dedicado.
* **Mecánica de "Muerte Súbita" 🔥:** Si el tablero se llena y no hay un ganador, ¡el juego no termina en empate! Se activa la fase de Muerte Súbita donde estás obligado a robar e intercambiar piezas activas del oponente para abrirte paso a la victoria.
* **Multiplataforma Nata 📱:** Desarrollado sobre arquitectura móvil nativa ideal para dispositivos Android.

---

## 🛠️ Stack Tecnológico

**Cliente (Mobile):**
* **React Native** & **Expo** (Usando Expo Router para la navegación por pantallas).
* **Socket.io-client** para la comunicación bidireccional asíncrona con el servidor.

**Servidor (Backend):**
* **Node.js** con **Express**.
* **Socket.io** para la gestión de salas dinámicas y sincronización de partidas.
* Desplegado en producción a través de **Render**.

---

## 📦 Arquitectura del Proyecto

El ecosistema está dividido en dos repositorios independientes para desacoplar el cliente móvil del backend:

```text
├── tic-tac-toe-plus/          # Código de la aplicación móvil (React Native)
└── tic-tac-toe-server/        # Código del servidor de juego (Node.js)
```

---

## 🔧 Instalación y Configuración Local

### Prerrequisitos

* Node.js (Versión 18 o superior)
* NPM
* Android SDK / Android Studio configurado (para compilaciones locales en Linux)

### 1. Clonar el repositorio

```bash
git clone https://github.com/LyenZo/tic-tac-toe-plus.git
cd tic-tac-toe-plus
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la URL del Servidor

Antes de compilar el APK, se debe activar el servidor en:

https://tic-tac-toe-server-tat4.onrender.com


### 4. Compilar el APK localmente (en Fedora)

Para generar el binario `.apk` ejecutable de forma local sin depender de nubes externas:

```bash
# 1. Generar carpetas nativas de Android
npx expo prebuild --platform android

# 2. Apuntar al entorno de Java interno de Android Studio
export JAVA_HOME=/opt/android-studio/jbr

# 3. Entrar a la carpeta nativa y compilar el APK
cd android && ./gradlew assembleDebug
```

Al finalizar con éxito, encontrarás tu instalador en:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔗 Enlaces del Proyecto

* **Repositorio del Cliente Móvil:** https://github.com/LyenZo/tic-tac-toe-plus
* **Repositorio del Servidor:** https://github.com/LyenZo/tic-tac-toe-server
* **Servidor en Producción:** https://tic-tac-toe-server-tat4.onrender.com

---

## 👥 Creadores

* **Marcos Jesús Ugalde Zarza** 
[@LyenZo](https://github.com/LyenZo)

* **Vanessa Escutia**
[@VanessaEscutia](https://github.com/VanessaEscutia)
---

