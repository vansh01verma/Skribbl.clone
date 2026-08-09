// ==========================================
// SOCKET.IO
// ==========================================

const socket = io();

let playerName = "";
let roomId = "";
let drawerId = null;
let gameStarted = false;
let isDrawing = false;
let canDraw = false;
let lastX = 0;
let lastY = 0;

const lobby = document.getElementById("lobby");
const game = document.getElementById("game");
const playerNameInput = document.getElementById("playerName");
const roomInput = document.getElementById("roomInput");
const createRoomButton = document.getElementById("createRoom");
const joinRoomButton = document.getElementById("joinRoom");
const lobbyError = document.getElementById("lobbyError");
const roomDisplay = document.getElementById("roomDisplay");
const playerList = document.getElementById("playerList");
const gameStatus = document.getElementById("gameStatus");
const timer = document.getElementById("timer");
const wordLabel = document.getElementById("wordLabel");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const brushSize = document.getElementById("brushSize");
const clearCanvasButton = document.getElementById("clearCanvas");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendMessageButton = document.getElementById("sendMessage");
const connectionStatus = document.getElementById("connectionStatus");

function setupCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
}
setupCanvas();

socket.on("connect", () => {
    connectionStatus.textContent = "🟢 Connected";
});

socket.on("disconnect", () => {
    connectionStatus.textContent = "🔴 Disconnected";
});

createRoomButton.addEventListener("click", () => {
    playerName = playerNameInput.value.trim();
    if (!playerName) return showLobbyError("Please enter your name.");
    socket.emit("create_room", playerName);
});

joinRoomButton.addEventListener("click", () => {
    playerName = playerNameInput.value.trim();
    roomId = roomInput.value.trim().toUpperCase();
    if (!playerName) return showLobbyError("Please enter your name.");
    if (!roomId) return showLobbyError("Please enter a Room ID.");
    socket.emit("join_room", { roomId, playerName });
});

playerNameInput.addEventListener("keydown", event => {
    if (event.key === "Enter") createRoomButton.click();
});

roomInput.addEventListener("keydown", event => {
    if (event.key === "Enter") joinRoomButton.click();
});

socket.on("room_created", newRoomId => {
    roomId = newRoomId;
    enterGame();
});

socket.on("room_joined", joinedRoomId => {
    roomId = joinedRoomId;
    enterGame();
});

function enterGame() {
    lobby.classList.add("hidden");
    game.classList.remove("hidden");
    roomDisplay.textContent = roomId;
    clearCanvas();
    gameStatus.textContent = "⏳ Waiting for game...";
}

socket.on("room_error", message => showLobbyError(message));

function showLobbyError(message) {
    lobbyError.textContent = message;
}

socket.on("players_updated", players => {
    playerList.innerHTML = "";
    players.forEach(player => {
        const li = document.createElement("li");
        let text = `${player.name} ⭐ ${player.score}`;
        if (player.id === drawerId) text += " 🎨";
        if (player.id === socket.id) text += " (You)";
        li.textContent = text;
        playerList.appendChild(li);
    });
});

socket.on("game_started", ({ drawerId: newDrawerId }) => {
    drawerId = newDrawerId;
    gameStarted = true;
    canDraw = socket.id === drawerId;
    clearCanvas();
    if (canDraw) {
        gameStatus.textContent = "🎨 You are drawing!";
        wordLabel.textContent = "🤫 Your secret word will appear here.";
        canvas.style.cursor = "crosshair";
    } else {
        gameStatus.textContent = "👀 Guess the drawing!";
        wordLabel.textContent = "🔤 Guess the word!";
        canvas.style.cursor = "default";
    }
});

socket.on("word_selected", ({ word }) => {
    wordLabel.textContent = `🤫 Draw: ${word}`;
});

socket.on("timer_update", time => {
    timer.textContent = time;
    timer.style.fontWeight = time <= 10 ? "bold" : "normal";
});

socket.on("round_ended", ({ word }) => {
    gameStarted = false;
    canDraw = false;
    gameStatus.textContent = "🏁 Round finished!";
    wordLabel.textContent = `The word was: ${word}`;
    setTimeout(() => {
        if (!gameStarted) wordLabel.textContent = "⏳ Next round starting...";
    }, 2000);
});

function getCanvasPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height
    };
}

canvas.addEventListener("mousedown", event => {
    if (!canDraw || !gameStarted) return;
    const position = getCanvasPosition(event);
    isDrawing = true;
    lastX = position.x;
    lastY = position.y;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    socket.emit("drawing_start", { roomId, x: lastX, y: lastY });
});

canvas.addEventListener("mousemove", event => {
    if (!isDrawing || !canDraw) return;
    const position = getCanvasPosition(event);
    drawLine(lastX, lastY, position.x, position.y);
    socket.emit("drawing", { roomId, x: position.x, y: position.y });
    lastX = position.x;
    lastY = position.y;
});

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

document.addEventListener("mouseup", () => { isDrawing = false; });

function drawLine(x1, y1, x2, y2) {
    ctx.lineWidth = Number(brushSize.value);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

socket.on("drawing_start", ({ x, y }) => {
    if (canDraw) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    lastX = x;
    lastY = y;
});

socket.on("drawing", ({ x, y }) => {
    if (canDraw) return;
    drawLine(lastX, lastY, x, y);
    lastX = x;
    lastY = y;
});

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

clearCanvasButton.addEventListener("click", () => {
    if (canDraw) clearCanvas();
});

sendMessageButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", event => {
    if (event.key === "Enter") sendMessage();
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !roomId) return;
    socket.emit("send_message", { roomId, playerName, message });
    messageInput.value = "";
}

socket.on("receive_message", ({ playerName: sender, message }) => {
    const div = document.createElement("div");
    div.className = "message";
    const name = document.createElement("strong");
    name.textContent = sender + ":";
    const text = document.createElement("span");
    text.textContent = " " + message;
    div.appendChild(name);
    div.appendChild(text);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
});

brushSize.addEventListener("input", () => {
    ctx.lineWidth = Number(brushSize.value);
});
