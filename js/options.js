const setPaddleSize = function(event) {
  let current = event.target;
  let size = current.getAttribute('size');
  let previous = document.querySelector('.paddle-option.active');
  if(previous) {
    previous.classList.remove('active');
  }
  current.classList.add('active');
  if(size == 'small') {
    document.documentElement.style.cssText = "--paddle-height: 4vh";
    localStorage.setItem('paddleHeight', '4vh')
  }
  if(size == 'medium') {
    document.documentElement.style.cssText = "--paddle-height: 8vh";
    localStorage.setItem('paddleHeight', '8vh')
  }
  if(size == 'large') {
    document.documentElement.style.cssText = "--paddle-height: 12vh";
    localStorage.setItem('paddleHeight', '12vh')
  }
}

const setGameSpeed = function(event) {
  let current = event.target;
  let speed = current.getAttribute('speed');
  let previous = document.querySelector('.speed-option.active');
  if(previous) {
    previous.classList.remove('active');
  }
  current.classList.add('active');
  if(speed === 'slow') {
    gameSpeed = 3;
    localStorage.setItem('gameSpeed', gameSpeed);
  }
  if(speed == 'normal') {
    gameSpeed = 5;
    localStorage.setItem('gameSpeed', gameSpeed);
  }
  if(speed == 'fast') {
    gameSpeed = 7;
    localStorage.setItem('gameSpeed', gameSpeed);
  }
}

const setCPUDifficulty = function(event) {
  let current = event.target;
  let mode = current.getAttribute('mode');
  let previous = document.querySelector('.difficulty-option.active');
  if(previous) {
    previous.classList.remove('active');
  }
  current.classList.add('active');  
  localStorage.setItem('difficulty', mode);
}

const loadDifficultyBtn = function() {
  let mode = localStorage.getItem('difficulty') ?? 'easy';
  let selector = `.difficulty-option[mode=${mode}]`;
  let button = document.querySelector(selector);
  button.classList.add('active');
}


const loadPaddleSize = function() {
    let paddleSize = localStorage.getItem('paddleHeight') ?? '8vh';
    let sizes = {'4vh':'small', '8vh':'medium', '12vh':'large'};
    document.documentElement.style.cssText = '--paddle-height: ' + paddleSize;
    let selector = `.paddle-option[size="${sizes[paddleSize]}"]`;
    let button = document.querySelector(selector);
    button.classList.add('active');
}

const loadSpeedBtn = function() {
  let speed = localStorage.getItem('gameSpeed') ?? '5';
  let speeds = {'3':'slow', '5':'normal', '7':'fast'};
  let selector = `.speed-option[speed=${speeds[speed]}]`
  let button = document.querySelector(selector);
  button.classList.add('active');
}

const loadModeBtn = function() {
  let modeBtn = document.getElementById('mode-btn');
  let mode = localStorage.getItem('mode');
  if(mode == '0') {
    modeBtn.innerHTML = 'Player vs Player';
    modeBtn.setAttribute('mode', '0');
  }
  else if(mode == '1') {
    modeBtn.innerHTML = 'Player vs AI';
    modeBtn.setAttribute('mode', '1');
  }
}

const loadOptions = function() {
  loadPaddleSize();
  loadSpeedBtn();
  loadModeBtn();
  loadDifficultyBtn();
}

document.addEventListener('DOMContentLoaded', loadOptions);