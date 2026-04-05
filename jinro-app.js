import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// あなたの設定
const firebaseConfig = {
  apiKey: "AIzaSyAAGqsbia2NQUA20gfy_0HGBKeQOVo3lVU",
  authDomain: "jinro-docchi-20260405.firebaseapp.com",
  databaseURL: "https://jinro-docchi-20260405-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jinro-docchi-20260405",
  storageBucket: "jinro-docchi-20260405.firebasestorage.app",
  messagingSenderId: "188645779150",
  appId: "1:188645779150:web:fbdc33844e1317876dd29f"
};

// 初期化
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// グローバル
let playerId;
let currentRoom;

// 参加処理
window.joinRoom = function () {
  const roomId = document.getElementById("roomId").value;
  const name = document.getElementById("name").value;

  currentRoom = roomId;
  playerId = "player_" + Math.random().toString(36).substr(2, 5);

  set(ref(db, `rooms/${roomId}/players/${playerId}`), {
    name: name,
    joinedAt: Date.now()
  });

  listenRoom(roomId);
};

// リアルタイム監視
function listenRoom(roomId) {
  onValue(ref(db, `rooms/${roomId}`), (snapshot) => {
    const data = snapshot.val();
    console.log("ルーム情報:", data);
    updateUI(data);
  });
}

// UI更新（仮）
function updateUI(data) {
  document.getElementById("game").style.display = "block";

  const playersDiv = document.getElementById("players");
  playersDiv.innerHTML = "";

  if (!data || !data.players) return;

  Object.values(data.players).forEach((p) => {
    const div = document.createElement("div");
    div.innerText = p.name;
    playersDiv.appendChild(div);
  });
}