let heldKeys = {38:false, 40:false, 87:false, 83:false};
let isStarted = false;
let isPaused = false;
var playerScores = {player1:0, player2:0};
var gameSpeed = undefined;
var ballDirection = undefined;
var mode = undefined;
let exclusions = [];

const main = function() {
  document.addEventListener('keydown', function(event) {
    if(mode === '1' && [38, 40].includes(event.keyCode)) return;
    if(event.keyCode == 27) pause();
    if(heldKeys[event.keyCode] !== undefined && !heldKeys[event.keyCode]) {
      move(event.keyCode);
      heldKeys[event.keyCode] = true;
    }
  });
  document.addEventListener('keyup', function(event) {
    if(heldKeys[event.keyCode] !== undefined) {
      heldKeys[event.keyCode] = false;
    }
  });
  document.addEventListener('click', function(event) {
    let mainMenu = document.getElementById('mainMenu');
    if(mainMenu.classList.contains('hide')) return;
    
    let optionBtns = document.getElementsByClassName('option-btn');
    if(elementInList(event.target, optionBtns)) return;
    
    resume();
    if(isStarted) return;
    
    let titlescreen = document.getElementById('titlescreen');
    if(titlescreen) {
      playerScores = {player1:0, player2:0};
      updateScore('none');
      titlescreen.classList.add('hide');
    }
    isStarted = true;
    start();
  });
}

const pause = function() {
  if(!isStarted) return;
  let titlescreen = document.getElementById('titlescreen');
  isPaused = true;
    titlescreen.classList.remove('hide');
}

const resume = function() {
  if(!isStarted) return;
  let titlescreen = document.getElementById('titlescreen');
  isPaused = false;
  titlescreen.classList.add('hide');
}


const initSpeed = function() {
  let speed = localStorage.getItem('gameSpeed') ?? '5';
  gameSpeed = Number(speed);
  console.log(gameSpeed);
  ballDirection = {x:-gameSpeed, y:getRandomInt(-gameSpeed, gameSpeed)};
}

const initMode = function() {
  mode = localStorage.getItem('mode');
}

const openOptions = function(event) {
  event.stopPropagation();
  const mainMenu = document.getElementById('mainMenu');
  const options = document.getElementById('options');
  mainMenu.classList.add('hide');
  options.classList.remove('hide');
}

const openControls = function(event) {
  event.stopPropagation();
  const mainMenu = document.getElementById('mainMenu');
  const controls = document.getElementById('controls');
  mainMenu.classList.add('hide');
  controls.classList.remove('hide');
}

const changeMode = function(event) {
  event.stopPropagation();
  let modeBtn = event.target;
  let mode = modeBtn.getAttribute('mode');
  if(mode == '0') {
    modeBtn.innerHTML = 'Player vs AI';
    modeBtn.setAttribute('mode', '1');
    localStorage.setItem('mode', '1');
  }
  else if(mode == '1') {
    modeBtn.innerHTML = 'Player vs Player';
    modeBtn.setAttribute('mode', '0');
    localStorage.setItem('mode', '0');
  }
}

const stopPropagation = function(event) {
  event.stopPropagation();
}

const backButton = function(event) {
  event.stopPropagation();
  let wrappers = document.getElementsByClassName('wrapper');
  let main = document.getElementById('mainMenu');
  for(let wrapper of wrappers ) {
    if(!wrapper.classList.contains('hide')) wrapper.classList.add('hide');
  }
  main.classList.remove('hide');
}


const start = function() {
  initMode();
  initSpeed();
  let ball = document.getElementById('ball');
  if(mode == '1') startCPU();
  playRound(ball);
}

function playRound(ball) {
  var refreshId = setInterval(async function() {
    if(isPaused) return;
    let collision = checkCollision(ball);
    switch(collision.type) {
      case 'wall':
        centerBall(ball);
        clearInterval(refreshId);
        if(checkForWinner()) {
          isStarted = false;
          break;
        }
        await countDown();
        playRound(ball);
        break;
      case 'top':
        console.log(ball.getBoundingClientRect().right );
        ballDirection.y = -ballDirection.y;
        updateBall(ball);
        break;
      case 'bottom':
        console.log(ball.getBoundingClientRect().right );
        ballDirection.y = -ballDirection.y;
        updateBall(ball);
        break;
      case 'player':
        console.log(ball.getBoundingClientRect().top);
        ballDirection.y = getRandomInt(gameSpeed + 2, -gameSpeed - 2);
        ballDirection.x = -ballDirection.x;
        updateBall(ball);
        break;
      default:
        updateBall(ball);
    }
  }, 16.7);
}

const checkForWinner = function() {
  let winner = null;
  if(playerScores['player1'] == 2) {
    winner = 'Player 1';
  }
  else if(playerScores['player2'] == 2) {
    winner = (mode == '0') ? 'Player 2': 'AI';
  }
  if(!winner) return null;
  let body = document.querySelector('body');
  let countDown = document.createElement('div');
  let titlescreen = document.getElementById('titlescreen');
  let wrapper = titlescreen.children[0];
  wrapper.children[0].innerHTML = `${winner} wins!!`;
  titlescreen.classList.remove('hide');
  
  return winner;
}

const countDown = async function() {
  let body = document.querySelector('body');
  let countDown = document.createElement('div');
  countDown.classList.add('countdown');
  countDown.innerHTML = '2'
  body.appendChild(countDown);
  await sleep(1000);
  countDown.innerHTML = '1';
  await sleep(1000);
  countDown.remove();
}

const centerBall = function(ball) {
  let canvas = document.getElementById('canvas');
  ball.style.top = `${canvas.offsetHeight / 2}px`;
  ball.style.left = `${canvas.offsetWidth / 2}px`;
}

const updateBall = function(ball) {
  ball.style.top = `${ball.offsetTop + ballDirection.y}px`;
  ball.style.left = `${ball.offsetLeft + ballDirection.x}px`;
}

const checkCollision = function(ball) {
  let ballPosition = ball.getBoundingClientRect();
  let canvas = document.getElementById('canvas');
  let player = document.getElementById('player');
  let player2 = document.getElementById('player2');
  let playerPosition = player.getBoundingClientRect();
  let player2Position = player2.getBoundingClientRect();

  if(ballPosition.top + ballDirection.y <= canvas.offsetTop) {
    return {type:'top'};
  }
  if(ballPosition.bottom + ballDirection.y >= canvas.offsetHeight) {
    return {type:'bottom'};
  }
  if(ballPosition.left + ballDirection.x <= canvas.offsetLeft) {
    updateScore('player2');
    return {type:'wall'};
  }
  if(ballPosition.right + ballDirection.x >= canvas.offsetWidth) {
    updateScore('player1');
    return {type:'wall'};
  }
  if(!(ballPosition.right + ballDirection.x < playerPosition.left) &&
    ballPosition.left + ballDirection.x <= playerPosition.right &&
    ((ballPosition.top + ballDirection.y > playerPosition.top &&
      ballPosition.top + ballDirection.y < playerPosition.bottom) ||
      (ballPosition.bottom + ballDirection.y > playerPosition.top &&
        ballPosition.bottom + ballDirection.y < playerPosition.bottom)
    )
  ) {
    return {type:'player'};
  }
  if(!(ballPosition.left + ballDirection.x > player2Position.right) &&
  ballPosition.right + ballDirection.x >= player2Position.left &&
  ((ballPosition.top + ballDirection.y > player2Position.top &&
    ballPosition.top + ballDirection.y < player2Position.bottom) ||
    (ballPosition.bottom + ballDirection.y > player2Position.top &&
      ballPosition.bottom + ballDirection.y < player2Position.bottom)
  )
  ) {
    return {type:'player'};
  }
  return {type:'none'};
} 
const updateScore = function(player) {
  let scoreboard = document.getElementById('scores');
  if(player == 'none') {
    scoreboard.innerHTML = `0 - 0`;
    return;
  }
  playerScores[player] += 1;

  if(player == 'player1') {
      scoreboard.innerHTML = `${playerScores[player]} - ${playerScores['player2']}`;
  }
  else {
    scoreboard.innerHTML = `${playerScores['player1']} - ${playerScores[player]}`;
  }
  
}
const move = function(keyCode) {
  var refreshId = setInterval(function() {
    if(isPaused) return;
    let player = null;
    let newTop = null;
    let direction = 0;
    switch(keyCode) {
      case 87:
        player = document.getElementById('player');
        newTop = player.offsetTop-gameSpeed;
        direction = -gameSpeed;
        break;
      case 83: 
        player = document.getElementById('player');
        newTop = player.offsetTop+gameSpeed;
        direction = gameSpeed;
        break;
      case 38: 
        player =  document.getElementById('player2');
        newTop = player.offsetTop-gameSpeed;
        direction = -gameSpeed;
        break;
      case 40: 
        player =  document.getElementById('player2');
        newTop = player.offsetTop+gameSpeed;
        direction = gameSpeed;
        break;
    }
    let playerRect = player.getBoundingClientRect();
    let canvas = document.getElementById('canvas');
    if((playerRect.bottom + direction >= canvas.offsetHeight ||
      playerRect.top + direction <= canvas.offsetTop)
    ) return;
    player.style.top =  `${newTop.toString()}px`;
    if(!heldKeys[keyCode]) {
      clearInterval(refreshId);
    }
  }, 16.7)
}

document.addEventListener('DOMContentLoaded', main);
