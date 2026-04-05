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

  // ←ここ修正
  playerId = localStorage.getItem("playerId");
  if (!playerId) {
    playerId = "player_" + Math.random().toString(36).substr(2, 5);
    localStorage.setItem("playerId", playerId);
  }

  localStorage.setItem("roomId", roomId);
  localStorage.setItem("name", name);

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
  const cardDiv = document.getElementById("cardButtons");
  const statusDiv = document.getElementById("status");

  playersDiv.innerHTML = "";
  cardDiv.innerHTML = "";
  statusDiv.innerHTML = "";

  if (!data || !data.players) return;

  const players = data.players;
  const me = players[playerId];

  // 参加者表示
  Object.values(players).forEach((p) => {
    const div = document.createElement("div");
    div.innerText = p.name;
    playersDiv.appendChild(div);
  });

  // 自分のカード表示
  if (me && me.cards) {
    me.cards.forEach((card) => {
      const btn = document.createElement("button");
      btn.innerText = card;

      btn.onclick = () => {
        selectCard(card);
      };

      cardDiv.appendChild(btn);
    });
  }

  // 全員選択チェック
  const allSelected = Object.values(players).every(p => p.selected);

  if (allSelected) {
    statusDiv.innerText = "全員選択完了！";
    showResult(players);
  } else {
    statusDiv.innerText = "他のプレイヤーを待っています...";
  }
}

function selectCard(card) {
  set(ref(db, `rooms/${currentRoom}/players/${playerId}/selected`), card);
}

function showResult(players) {
  const resultDiv = document.createElement("div");
  resultDiv.innerHTML = "<h3>結果</h3>";

  Object.values(players).forEach((p) => {
    const div = document.createElement("div");
    div.innerText = `${p.name}: ${p.selected}`;
    resultDiv.appendChild(div);
  });

  document.body.appendChild(resultDiv);
}

import { get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

function startGame() {
  const roles = ["人狼", "市民", "占い師", "警察"];

  get(ref(db, `rooms/${currentRoom}/players`)).then((snapshot) => {
    const players = snapshot.val();
    const ids = Object.keys(players);

    ids.forEach((pid) => {
      const shuffled = [...roles].sort(() => 0.5 - Math.random());

      set(ref(db, `rooms/${currentRoom}/players/${pid}/cards`), [
        shuffled[0],
        shuffled[1]
      ]);
    });
  });
}

playerId = localStorage.getItem("playerId");

if (!playerId) {
  playerId = "player_" + Math.random().toString(36).substr(2, 5);
  localStorage.setItem("playerId", playerId);
}

const savedRoom = localStorage.getItem("roomId");
const savedName = localStorage.getItem("name");

if (savedRoom && savedName) {
  document.getElementById("roomId").value = savedRoom;
  document.getElementById("name").value = savedName;
}
