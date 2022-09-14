const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const btnReset = document.querySelector('#reset');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pendejo = new Audio('./audio.mp3')

let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeInterval;

const playerPosition = {
  x: undefined,
  y: undefined
};
const giftPosition = {
  x: undefined,
  y: undefined
}
let enemiesPositions = [];

window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);

btnReset.addEventListener('click', resetGame);

function setCanvasSize() {
  if (window.innerHeight > window.innerWidth) {
    canvasSize = window.innerWidth * 0.7;
  } else {
    canvasSize = window.innerHeight * 0.7;
  }

  canvasSize = Number(canvasSize.toFixed(0));
  
  canvas.setAttribute('width', canvasSize);
  canvas.setAttribute('height', canvasSize);
  
  elementsSize = canvasSize / 10;
  elementsSize = Number(elementsSize.toFixed(0));
  playerPosition.x = undefined;
  playerPosition.y = undefined;

  startGame();
}

function startGame() {
  console.log({ canvasSize, elementsSize });

  game.font = elementsSize + 'px Verdana';
  game.textAlign = 'end';

  const map = maps[level];

  if(!map){
    gameWin();

    return;
  }

  if(!timeStart){
    timeStart = Date.now();
    timeInterval = setInterval(showTime, 100);
  }

  showLives();
  showRecord();

  const mapRows = map.trim().split('\n');
  const mapRowCols = mapRows.map(row => row.trim().split(''));

  enemiesPositions = [];
  game.clearRect(0,0,canvasSize,canvasSize)
  mapRowCols.forEach((row, rowI) => {
    row.forEach((col, colI) => {
      const emoji = emojis[col];
      const posX = elementsSize * (colI + 1);
      const posY = elementsSize * (rowI + 1);

      if(col == 'O'){
        if(!playerPosition.x && !playerPosition.y){
          playerPosition.x = posX;
          playerPosition.y = posY;
        } 
      } else if(col == 'I'){
        giftPosition.x = posX;
        giftPosition.y = posY;
      } else if(col == 'X'){
        enemiesPositions.push({x: posX, y: posY});
      }

      game.fillText(emoji, posX, posY)
    })
  })
  movePlayer();
}

function movePlayer(){
  const giftCollisionX = Math.floor(playerPosition.x) == Math.floor(giftPosition.x);
  const giftCollisionY = Math.floor(playerPosition.y) == Math.floor(giftPosition.y);
  const giftCollision = giftCollisionX && giftCollisionY;

  if(giftCollision){
    levelWin();
  }

  const enemyCollision = enemiesPositions.find(enemy => {
    const enemyCollisionX = Math.floor(enemy.x) == Math.floor(playerPosition.x);
    const enemyCollisionY = Math.floor(enemy.y) == Math.floor(playerPosition.y);
    return enemyCollisionX && enemyCollisionY;
  });

  if(enemyCollision){
    levelFail();
  }

  game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y);
}

function showLives() {
  const heartsArray = Array(lives).fill(emojis['HEART']); // [1,2,3]
  // console.log(heartsArray);
  
  spanLives.innerHTML = "";
  heartsArray.forEach(heart => spanLives.append(heart));
}

function showTime(){
  spanTime.innerHTML = +((Date.now()-timeStart)/1000);
}

function showRecord(){
  spanRecord.innerHTML = localStorage.getItem('record_time');
}

function levelFail(){
  lives--;
  spanLives.innerHTML = emojis['HEART'];

  if(lives <= 0){
    level = 0;
    lives = 3;
    pendejo.play();
    timeStart = undefined;
  }

  const enemyCollision = enemiesPositions.find(enemy => {
    const enemyCollisionX = Math.floor(enemy.x) == Math.floor(playerPosition.x);
    const enemyCollisionY = Math.floor(enemy.y) == Math.floor(playerPosition.y);
    return enemyCollisionX && enemyCollisionY;
  });
  
  const boom = setInterval(() => {canvas.classList.toggle('inactive'); game.fillText(emojis['BOMB_COLLISION'], enemyCollision.x, enemyCollision.y)}, 50);

  setTimeout(() => {clearInterval(boom); startGame() }, 300);
  
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}

function levelWin(){
  level++;
  startGame();
}

function gameWin(){
  clearInterval(timeInterval);

  const recordTime = localStorage.getItem('record_time');
  const playerTime = +((Date.now()-timeStart)/1000);
  

  if(recordTime){
    if(recordTime >= playerTime){
      localStorage.setItem('record_time', playerTime);
    } else{
      console.log('Lo siento no superaste el record :(')
    }
  } else{
    localStorage.setItem('record_time', playerTime)
  }
}

function moveUp(){
  console.log('Moviendose hacía arriba');

  if((playerPosition.y - elementsSize) < elementsSize){
    console.log('OUT')
  }else{
    playerPosition.y -= elementsSize;
    startGame();
  }
}

function moveDown(){
  console.log('Moviendose hacía abajo');
  if(Math.floor((playerPosition.y + elementsSize)) > Math.floor(canvasSize)){
    console.log('OUT')
  }else{
    playerPosition.y += elementsSize;
    startGame();
  }
}

function moveLeft(){
  console.log('Moviendose hacía la izquierda');
  if((playerPosition.x - elementsSize) < elementsSize){
    console.log('OUT');
  }else{
    playerPosition.x -= elementsSize;
    startGame()
  }
}

function moveRight(){
  console.log('Moviendose hacía la derecha');
  if((playerPosition.x + elementsSize) > canvasSize){
    console.log('OUT')
  } else{
    playerPosition.x += elementsSize;
    startGame()
  }
}

btnUp.addEventListener('click', moveUp);
btnDown.addEventListener('click', moveDown);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);

window.addEventListener('keydown', event => {
  console.log(event)
  if(event.key == 'ArrowDown'){
    moveDown();
  }
  if(event.key == 'ArrowUp'){
    moveUp();
  }
  if(event.key == 'ArrowLeft'){
    moveLeft();
  }
  if(event.key == 'ArrowRight'){
    moveRight();
  }
})

function resetGame(){
  location.reload();
}