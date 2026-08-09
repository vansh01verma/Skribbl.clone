# 🎨 Skribbl Clone

A real-time multiplayer drawing and guessing game inspired by Skribbl.io, built with **Node.js, Express, Socket.IO, HTML, CSS, and JavaScript**.

## 🚀 Live Demo

**Play the deployed game:**

https://skribbl-clone-h16k.onrender.com

## ✨ Features

- 🎮 Create a private game room
- 👥 Up to **10 players per room**
- 🔑 Join a room using a room code
- 🎨 Real-time collaborative drawing
- 💬 Real-time chat and guessing
- 🎯 Automatic correct-guess detection
- 🏆 Player scoring
- ⏱️ Timed rounds
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

## 🎮 Core Game Flow

1. Open the [live game](https://skribbl-clone-h16k.onrender.com).
2. Enter your player name.
3. Create a room or enter an existing room code.
4. Up to 10 players can join the same room.
5. The round starts automatically when at least 2 players are present.
6. The selected drawer receives the secret word.
7. The drawer draws on the canvas in real time.
8. Other players submit guesses through chat.
9. A correct guess awards points and ends the round.
10. The next round starts with a new drawer and word.

## 📂 Project Structure

```text
Skribbl.clone/
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
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

The application is deployed as a Node.js web service on Render. The server uses the platform-provided `PORT` environment variable and supports Socket.IO WebSocket connections for real-time multiplayer gameplay.

**Production URL:** https://skribbl-clone-h16k.onrender.com

## 📌 Project Status

- ✅ Publicly deployed
- ✅ Up to 10 players per room
- ✅ Room creation and joining
- ✅ Real-time drawing
- ✅ Real-time guessing/chat
- ✅ Scoring system
- ✅ Timed rounds
- ✅ Automatic round progression

## 👨‍💻 Author

**Vansh Verma**

GitHub: https://github.com/vansh01verma
