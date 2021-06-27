const score = document.querySelector(".score");
const start = document.querySelector(".start");
const gameArea = document.querySelector(".game-area");
const btns = document.querySelectorAll(".btn");

const car = document.createElement("div");
car.classList.add("car");

const MAX_ENEMY = 5;
const HEIGHT_ELEM = 100;

const currentScore = document.querySelector(".current-score");
const recordScore = document.querySelector(".record-score");

const music = new Audio("audio.mp3");
music.volume = 0.05;

start.addEventListener("click", startGame);
document.addEventListener("keydown", startRun);
document.addEventListener("keyup", stopRun);

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

const setting = {
  start: false,
  score: 0,
  speed: 3,
  traffic: 3,
};

let startSpeed = 0;

function getQuantityElements(heightElement) {
  return gameArea.offsetHeight / heightElement + 1;
}

function getRandomEnemy(max) {
  return Math.floor(Math.random() * max + 1);
}

function changeLevel(level) {
  switch (level) {
    case "1":
      setting.traffic = 3;
      setting.speed = 3;
      break;
    case "2":
      setting.traffic = 3;
      setting.speed = 5;
      break;
    case "3":
      setting.traffic = 3;
      setting.speed = 7;
      break;
  }

  startSpeed = setting.speed;
}

function startGame(event) {
  if (!event.target.classList.contains("btn")) return;
  btns.forEach((btn) => (btn.disabled = true));
  gameArea.style.minHeight =
    Math.floor(
      (document.documentElement.clientHeight - HEIGHT_ELEM) / HEIGHT_ELEM
    ) * HEIGHT_ELEM;

  const level = event.target.dataset.level;
  changeLevel(level);

  music.play();

  start.classList.add("hide");
  score.classList.remove("hide");
  gameArea.innerHTML = "";

  let lastRecord = localStorage.getItem("record") || 0;
  recordScore.innerHTML = `Last record<br>${lastRecord}`;

  for (let i = 0; i < getQuantityElements(HEIGHT_ELEM); i++) {
    const line = document.createElement("div");
    line.classList.add("line");
    line.style.top = i * HEIGHT_ELEM + "px";
    line.style.height = HEIGHT_ELEM / 2 + "px";
    line.y = i * HEIGHT_ELEM;
    gameArea.append(line);
  }

  for (let i = 0; i < getQuantityElements(HEIGHT_ELEM * setting.traffic); i++) {
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.y = -HEIGHT_ELEM * setting.traffic * i;
    enemy.style.left =
      Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + "px";
    enemy.style.top = enemy.y + "px";
    enemy.style.background = `
      transparent
      url(./image/enemy${getRandomEnemy(MAX_ENEMY)}.png)
      center / cover
      no-repeat`;
    gameArea.append(enemy);
  }
  setting.score = 0;
  setting.start = true;
  gameArea.append(car);
  car.style.left = gameArea.offsetWidth / 2 - car.offsetWidth / 2;
  car.style.top = "auto";
  car.style.bottom = "10px";
  setting.x = car.offsetLeft;
  setting.y = car.offsetTop;
  requestAnimationFrame(playGame);
}

function playGame() {
  if (setting.start) {
    setting.score += setting.speed;
    currentScore.innerHTML = `<span class="current-score">SCORE<br>${setting.score}</span>`;

    setting.speed = startSpeed + Math.floor(setting.score / 5000);

    moveRoad();
    moveEnemy();
    if (keys.ArrowLeft && setting.x > 0) {
      setting.x -= setting.speed;
    }
    if (keys.ArrowRight && setting.x < gameArea.offsetWidth - car.offsetWidth) {
      setting.x += setting.speed;
    }
    if (keys.ArrowUp && setting.y > 0) {
      setting.y -= setting.speed;
    }
    if (
      keys.ArrowDown &&
      setting.y < gameArea.offsetHeight - car.offsetHeight
    ) {
      setting.y += setting.speed;
    }

    car.style.left = setting.x + "px";
    car.style.top = setting.y + "px";
    requestAnimationFrame(playGame);
  } else {
    music.pause();
    music.currentTime = 0;
    btns.forEach((btn) => (btn.disabled = false));
  }
}

function startRun(event) {
  if (keys.hasOwnProperty(event.key)) {
    event.preventDefault();
    keys[event.key] = true;
  }
}

function stopRun(event) {
  if (keys.hasOwnProperty(event.key)) {
    event.preventDefault();
    keys[event.key] = false;
  }
}

function moveRoad() {
  let lines = document.querySelectorAll(".line");
  lines.forEach(function (line) {
    line.y += setting.speed;
    line.style.top = line.y + "px";
    if (line.y >= gameArea.offsetHeight) {
      line.y = -HEIGHT_ELEM;
    }
  });
}

function moveEnemy() {
  let enemy = document.querySelectorAll(".enemy");
  enemy.forEach(function (item) {
    let carRect = car.getBoundingClientRect();
    let enemyRect = item.getBoundingClientRect();

    if (
      carRect.top <= enemyRect.bottom &&
      carRect.right >= enemyRect.left &&
      carRect.left <= enemyRect.right &&
      carRect.bottom >= enemyRect.top
    ) {
      setting.start = false;
      console.warn("boom");
      start.classList.remove("hide");
      if (setting.score > localStorage.getItem("record")) {
        recordScore.innerHTML = `New record<br>${setting.score}`;
        localStorage.setItem("record", setting.score);
      }
    }

    item.y += setting.speed / 2;
    item.style.top = item.y + "px";
    if (item.y >= gameArea.offsetHeight) {
      item.y = -HEIGHT_ELEM * setting.traffic;
      item.style.left =
        Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + "px";
    }
  });
}
