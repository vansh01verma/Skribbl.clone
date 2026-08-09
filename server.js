const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};
const WORDS = ["apple","house","car","tree","computer","phone","dog","cat","pizza","rocket","football","school","book","flower","mountain","river","chair","table"];

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function updatePlayers(roomId) {
    const room = rooms[roomId];
    if (!room) return;
    io.to(roomId).emit("players_updated", room.players.map(player => ({ id: player.id, name: player.name, score: player.score })));
}

function startRound(roomId) {
    const room = rooms[roomId];
    if (!room || room.players.length < 2) return;

    room.gameStarted = true;
    room.timeLeft = 60;
    room.word = getRandomWord();
    room.drawerIndex++;
    if (room.drawerIndex >= room.players.length) room.drawerIndex = 0;
    room.drawerId = room.players[room.drawerIndex].id;

    io.to(roomId).emit("game_started", { drawerId: room.drawerId });
    io.to(room.drawerId).emit("word_selected", { word: room.word });
    io.to(roomId).emit("timer_update", room.timeLeft);

    room.timer = setInterval(() => {
        room.timeLeft--;
        io.to(roomId).emit("timer_update", room.timeLeft);
        if (room.timeLeft <= 0) endRound(roomId);
    }, 1000);
}

function endRound(roomId) {
    const room = rooms[roomId];
    if (!room) return;
    if (room.timer) {
        clearInterval(room.timer);
        room.timer = null;
    }
    const word = room.word;
    room.gameStarted = false;
    io.to(roomId).emit("round_ended", { word });
    setTimeout(() => {
        if (rooms[roomId] && rooms[roomId].players.length >= 2) startRound(roomId);
    }, 3000);
}

io.on("connection", socket => {
    socket.on("create_room", playerName => {
        let roomId = generateRoomId();
        while (rooms[roomId]) roomId = generateRoomId();
        rooms[roomId] = { players: [], gameStarted: false, drawerIndex: -1, drawerId: null, word: "", timeLeft: 0, timer: null };
        rooms[roomId].players.push({ id: socket.id, name: playerName, score: 0 });
        socket.join(roomId);
        socket.roomId = roomId;
        socket.playerName = playerName;
        socket.emit("room_created", roomId);
        updatePlayers(roomId);
    });

    socket.on("join_room", ({ roomId, playerName }) => {
        roomId = roomId.trim().toUpperCase();
        const room = rooms[roomId];
        if (!room) return socket.emit("room_error", "Room not found");
        if (room.players.length >= 2) return socket.emit("room_error", "Room is full");
        room.players.push({ id: socket.id, name: playerName, score: 0 });
        socket.join(roomId);
        socket.roomId = roomId;
        socket.playerName = playerName;
        socket.emit("room_joined", roomId);
        updatePlayers(roomId);
        setTimeout(() => {
            if (rooms[roomId] && rooms[roomId].players.length >= 2 && !rooms[roomId].gameStarted) startRound(roomId);
        }, 1000);
    });

    socket.on("drawing_start", ({ roomId, x, y }) => {
        const room = rooms[roomId];
        if (!room || socket.id !== room.drawerId) return;
        socket.to(roomId).emit("drawing_start", { x, y });
    });

    socket.on("drawing", ({ roomId, x, y }) => {
        const room = rooms[roomId];
        if (!room || socket.id !== room.drawerId) return;
        socket.to(roomId).emit("drawing", { x, y });
    });

    socket.on("send_message", ({ roomId, playerName, message }) => {
        const room = rooms[roomId];
        if (!room) return;
        message = String(message).trim();
        if (!message) return;

        if (room.gameStarted && socket.id !== room.drawerId && message.toLowerCase() === room.word.toLowerCase()) {
            const player = room.players.find(p => p.id === socket.id);
            if (player) player.score += 10;
            io.to(roomId).emit("receive_message", { playerName: "🎯 SYSTEM", message: `${playerName} guessed correctly!` });
            updatePlayers(roomId);
            endRound(roomId);
            return;
        }

        io.to(roomId).emit("receive_message", { playerName, message });
    });

    socket.on("disconnect", () => {
        const roomId = socket.roomId;
        if (!roomId || !rooms[roomId]) return;
        const room = rooms[roomId];
        room.players = room.players.filter(player => player.id !== socket.id);
        if (room.timer) {
            clearInterval(room.timer);
            room.timer = null;
        }
        updatePlayers(roomId);
        if (room.players.length === 0) delete rooms[roomId];
        else room.gameStarted = false;
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log("🎨 SKRIBBL CLONE SERVER");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("================================");
});
