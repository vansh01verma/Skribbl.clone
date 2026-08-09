// ==========================================
// SOCKET.IO
// ==========================================
const socket = io();
let playerName="",roomId="",drawerId=null,gameStarted=false,isDrawing=false,canDraw=false,lastX=0,lastY=0,currentColor="#111111";
const lobby=document.getElementById("lobby"),game=document.getElementById("game"),playerNameInput=document.getElementById("playerName"),roomInput=document.getElementById("roomInput"),createRoomButton=document.getElementById("createRoom"),joinRoomButton=document.getElementById("joinRoom"),lobbyError=document.getElementById("lobbyError"),roomDisplay=document.getElementById("roomDisplay"),playerList=document.getElementById("playerList"),gameStatus=document.getElementById("gameStatus"),timer=document.getElementById("timer"),wordLabel=document.getElementById("wordLabel"),canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d"),brushSize=document.getElementById("brushSize"),clearCanvasButton=document.getElementById("clearCanvas"),messages=document.getElementById("messages"),messageInput=document.getElementById("messageInput"),sendMessageButton=document.getElementById("sendMessage"),connectionStatus=document.getElementById("connectionStatus");

function setupCanvas(){ctx.fillStyle="white";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.lineCap="round";ctx.lineJoin="round"} setupCanvas();

document.querySelectorAll(".color-btn").forEach(button=>{button.addEventListener("click",()=>{currentColor=button.dataset.color;document.querySelectorAll(".color-btn").forEach(b=>b.classList.remove("active"));button.classList.add("active")})});
socket.on("connect",()=>connectionStatus.innerHTML='<span class="status-dot" style="background:#22c55e"></span> Connected');
socket.on("disconnect",()=>connectionStatus.innerHTML='<span class="status-dot" style="background:#ef4444"></span> Disconnected');
createRoomButton.addEventListener("click",()=>{playerName=playerNameInput.value.trim();if(!playerName)return showLobbyError("Please enter your name.");socket.emit("create_room",playerName)});
joinRoomButton.addEventListener("click",()=>{playerName=playerNameInput.value.trim();roomId=roomInput.value.trim().toUpperCase();if(!playerName)return showLobbyError("Please enter your name.");if(!roomId)return showLobbyError("Please enter a Room ID.");socket.emit("join_room",{roomId,playerName})});
playerNameInput.addEventListener("keydown",e=>{if(e.key==="Enter")createRoomButton.click()});roomInput.addEventListener("keydown",e=>{if(e.key==="Enter")joinRoomButton.click()});
socket.on("room_created",id=>{roomId=id;enterGame()});socket.on("room_joined",id=>{roomId=id;enterGame()});
function enterGame(){lobby.classList.add("hidden");game.classList.remove("hidden");roomDisplay.textContent=roomId;clearCanvas();gameStatus.textContent="⏳ Waiting for game..."}
socket.on("room_error",showLobbyError);function showLobbyError(message){lobbyError.textContent=message}
socket.on("players_updated",players=>{playerList.innerHTML="";players.forEach(p=>{const li=document.createElement("li");let text=`${p.name} ⭐ ${p.score}`;if(p.id===drawerId)text+=" 🎨";if(p.id===socket.id)text+=" (You)";li.textContent=text;playerList.appendChild(li)})});

socket.on("game_started",({drawerId:newDrawerId,wordLength})=>{
    drawerId=newDrawerId;gameStarted=true;canDraw=socket.id===drawerId;clearCanvas();
    gameStatus.textContent=canDraw?"🎨 You are drawing!":"👀 Guess the drawing!";
    wordLabel.textContent=canDraw?"🤫 Your secret word will appear here.":`🔤 ${wordLength} letters • Waiting for hints...`;
    canvas.style.cursor=canDraw?"crosshair":"default";
});

socket.on("word_selected",({word})=>wordLabel.textContent=`🤫 Draw: ${word}`);

socket.on("hint_update",({wordLength,maskedWord,hintsRevealed,lettersLeft})=>{
    if(canDraw)return;
    if(lettersLeft>0){
        wordLabel.textContent=`💡 ${wordLength} letters • ${maskedWord} • ${lettersLeft} left`;
    }else{
        wordLabel.textContent=`💡 ${maskedWord} • Last hint!`;
    }
});

socket.on("timer_update",time=>{timer.textContent=time;timer.style.fontWeight=time<=10?"bold":"normal"});
socket.on("round_ended",({word})=>{gameStarted=false;canDraw=false;gameStatus.textContent="🏁 Round finished!";wordLabel.textContent=`The word was: ${word}`;setTimeout(()=>{if(!gameStarted)wordLabel.textContent="⏳ Next round starting..."},2000)});
function getCanvasPosition(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
canvas.addEventListener("mousedown",e=>{if(!canDraw||!gameStarted)return;const p=getCanvasPosition(e);isDrawing=true;lastX=p.x;lastY=p.y;ctx.beginPath();ctx.moveTo(lastX,lastY);socket.emit("drawing_start",{roomId,x:lastX,y:lastY,color:currentColor})});
canvas.addEventListener("mousemove",e=>{if(!isDrawing||!canDraw)return;const p=getCanvasPosition(e);drawLine(lastX,lastY,p.x,p.y,currentColor);socket.emit("drawing",{roomId,x:p.x,y:p.y,color:currentColor});lastX=p.x;lastY=p.y});
function stopDrawing(){isDrawing=false;ctx.beginPath()} canvas.addEventListener("mouseup",stopDrawing);canvas.addEventListener("mouseleave",stopDrawing);document.addEventListener("mouseup",()=>isDrawing=false);
function drawLine(x1,y1,x2,y2,color=currentColor){ctx.lineWidth=Number(brushSize.value);ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
socket.on("drawing_start",({x,y,color})=>{if(canDraw)return;ctx.beginPath();ctx.moveTo(x,y);lastX=x;lastY=y;ctx.strokeStyle=color||"#111111"});
socket.on("drawing",({x,y,color})=>{if(canDraw)return;drawLine(lastX,lastY,x,y,color||"#111111");lastX=x;lastY=y});
function clearCanvas(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="white";ctx.fillRect(0,0,canvas.width,canvas.height)}
clearCanvasButton.addEventListener("click",()=>{if(canDraw)clearCanvas()});sendMessageButton.addEventListener("click",sendMessage);messageInput.addEventListener("keydown",e=>{if(e.key==="Enter")sendMessage()});
function sendMessage(){const message=messageInput.value.trim();if(!message||!roomId)return;socket.emit("send_message",{roomId,playerName,message});messageInput.value=""}
socket.on("receive_message",({playerName:sender,message})=>{const div=document.createElement("div");div.className="message";const name=document.createElement("strong");name.textContent=sender+":";const text=document.createElement("span");text.textContent=" "+message;div.appendChild(name);div.appendChild(text);messages.appendChild(div);messages.scrollTop=messages.scrollHeight});
brushSize.addEventListener("input",()=>ctx.lineWidth=Number(brushSize.value));
