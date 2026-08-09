# 🎨 Skribbl Clone

A real-time multiplayer drawing and guessing game inspired by Skribbl.io, built with **Node.js, Express, Socket.IO, HTML, CSS, JavaScript, and HTML5 Canvas**.

## 🚀 Live Demo

**Play the deployed game:**

https://skribbl-clone-h16k.onrender.com

## 📸 Screenshots

### 🏠 Lobby

![Skribbl Clone Lobby](screenshots/lobby.png)

### 📝 Word Selection

![Three-word selection](screenshots/word-selection.png)

### 🎨 Multiplayer Drawing

![Multiplayer drawing](screenshots/multiplayer-drawing.png)

### 🏆 Final Leaderboard

![Final leaderboard](screenshots/leaderboard.png)

> These screenshots show the main lobby, word-selection flow, real-time multiplayer drawing, and final scoring experience.

## ✨ Features

- 🎮 Create a room with configurable settings
- 👑 Host-controlled lobby and game start
- 👥 Configurable maximum players (2–20)
- 🔄 Configurable rounds (2–10)
- ⏱️ Configurable draw time (15–240 seconds)
- 🎯 Configurable word choices (1–5)
- 💡 Configurable hints (0–5)
- 🔑 Join using a room code or invite link
- 🎨 Real-time collaborative drawing with HTML5 Canvas
- 🌈 Multiple drawing colors
- 🖌️ Adjustable brush size
- ↶ Synchronized undo
- 🧹 Clear canvas
- 📝 Drawer receives multiple word choices
- 💬 Real-time chat and guessing
- 🎯 Automatic correct-guess detection
- 🏆 Scoring and final leaderboard
- 🥇 Game-over winner screen
- 🔄 Automatic drawer rotation
- 📱 Browser-based gameplay

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- HTML Canvas API

### Backend
- Node.js
- Express.js
- Socket.IO

### Deployment
- Render

## 🧠 Architecture Overview

```text
Browser A (Drawer)
       │
       │ Socket.IO events
       ▼
   Node.js + Express + Socket.IO Server
       │
       ├── Room state
       ├── Player scores
       ├── Round / timer state
       ├── Secret word + choices
       ├── Drawing stroke history
       └── Game settings
       │
       │ Socket.IO broadcasts
       ▼
Browser B / Other Players
       │
       ├── Live drawing
       ├── Hints
       ├── Chat / guesses
       ├── Scores
       └── Round updates
```

The server is authoritative for room membership, the secret word, scoring, drawing permissions, round progression, settings, and the final leaderboard.

## 🎮 Core Game Flow

1. Open the [live game](https://skribbl-clone-h16k.onrender.com).
2. Enter your player name.
3. Create a room.
4. The host configures players, rounds, draw time, word choices, and hints.
5. Share the room code or invite link.
6. Players join the lobby.
7. The host starts the game.
8. The drawer receives the configured number of secret-word choices.
9. The drawer selects one word and draws on the canvas in real time.
10. Other players submit guesses through chat.
11. A correct guess awards points and ends the round.
12. Hints progressively reveal letters according to the room settings.
13. The drawer rotates and the next round begins.
14. After the configured number of rounds, the final leaderboard and winner are displayed.

## 📂 Project Structure

```text
Skribbl.clone/
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── screenshots/
│   ├── lobby.png
│   ├── word-selection.png
│   ├── multiplayer-drawing.png
│   └── leaderboard.png
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## 💻 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/vansh01verma/Skribbl.clone.git
cd Skribbl.clone
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

The application will be available at:

```text
http://localhost:3000
```

## 🌐 Deployment

The application is deployed as a Node.js web service on Render. The server listens on the platform-provided `PORT` environment variable and supports Socket.IO WebSocket connections for real-time multiplayer gameplay.

**Production URL:** https://skribbl-clone-h16k.onrender.com

## 📌 Assignment Checklist

- ✅ Room creation and joining
- ✅ Host-controlled lobby
- ✅ Configurable room settings
- ✅ Room code and invite link
- ✅ Turn-based rounds
- ✅ Real-time drawing
- ✅ 1–5 word choices for the drawer
- ✅ Guessing and scoring
- ✅ Leaderboard and winner
- ✅ Game-end screen
- ✅ Brush, colors, undo, and clear
- ✅ Hints
- ✅ Chat
- ✅ Countdown timer
- ✅ Public deployment

## 👨‍💻 Author

**Vansh Verma**

GitHub: https://github.com/vansh01verma

Repository: https://github.com/vansh01verma/Skribbl.clone
