let isMoving = false;
//easy .2 medium .325 hard .40
let accuracy = 0.5;
function cpuMove(direction, ticks) {
  isMoving = true;
  let refreshId = setInterval(function() {
    if(isPaused) return;
    let player = document.getElementById('player2');;
    let newTop = undefined;
    switch (direction) {
      case 'up':
        newTop = player.offsetTop-gameSpeed;
        var paddleDirection = -gameSpeed;
        break;
      case 'down':
        newTop = player.offsetTop+gameSpeed;
        var paddleDirection = gameSpeed;
        break;
    }

    if(ticks <= 0 || !isStarted) {
      clearInterval(refreshId); //change this so the ai knows
      isMoving = false;
    }
    ticks--;

    let playerRect = player.getBoundingClientRect();
    let canvas = document.getElementById('canvas');
    if((playerRect.bottom + paddleDirection >= canvas.offsetHeight ||
      playerRect.top + paddleDirection <= canvas.offsetTop)
    ) return;
    player.style.top = `${newTop.toString()}px`;
  }, 16.7);
}

function setAccuracy() {
  let difficulty = localStorage.getItem('difficulty')
  let accuracies = {'easy': 0.70,
                    'medium':0.80,
                    'hard':0.90
  };
  accuracy = accuracies[difficulty];
}

function getBallCoodinates() {
  let ball = document.getElementById('ball');
  let ballBox = ball.getBoundingClientRect();
  return {'top':{x:(ballBox.left + ballBox.right)/2, 
                 y:ballBox.top  
          },
          'bottom':{x:(ballBox.left + ballBox.right)/2,
                    y:ballBox.bottom
          },
          'right':{x:ballBox.right,
                   y:(ballBox.top + ballBox.bottom)/2
          },
          'left':{x:ballBox.left,
                   y:(ballBox.top + ballBox.bottom)/2
          }
  }
}



function getIntersection(ballDirectionY, ballCoordinates) {
  let canvas = document.getElementById('canvas');
  let canvasBox = canvas.getBoundingClientRect();
  let isGoingUp = ballDirectionY < 0;
  if(isGoingUp) {
    var y = ballCoordinates.top.y;
    var rightx = ballCoordinates.right.x;
    var bottomy = ballCoordinates.bottom.y;
  }
  else {
    var y = ballCoordinates.bottom.y;
    var rightx = ballCoordinates.right.x;
    var topy = ballCoordinates.top.y;
  }
  
  if(isGoingUp) {
    let numberOfTicks = Math.floor(Math.abs(y/ballDirectionY));
    let moveX = numberOfTicks*ballDirection.x;
    let moveY = numberOfTicks*ballDirectionY;
    return {right:rightx + moveX, top:y + moveY, bottom:bottomy + moveY}
  }
  else {
    let numberOfTicks = Math.floor((canvasBox.bottom - y) / ballDirectionY);
    let moveX = numberOfTicks*ballDirection.x;
    let moveY = numberOfTicks*ballDirectionY;
    return {right:rightx + moveX, top:topy + moveY, bottom: y + moveY}
  }
}

function getBallIntersectWithPaddle(ballCoordinates, ballDirectionY) {
  let player2 = document.getElementById('player2');
  let player2Box = player2.getBoundingClientRect();
  let numberOfTicks = Math.floor((player2Box.left - ballCoordinates.right)/ballDirection.x);
  return (ballCoordinates.top + ballCoordinates.bottom)/2 + (numberOfTicks*ballDirectionY);
}


function getLastBounce() {
  let player2 = document.getElementById('player2');
  let player2Box = player2.getBoundingClientRect();
  let ballDirectionY = ballDirection.y; 
  let ballCoordinates = getBallCoodinates();
  let intersectionData = getIntersection(ballDirectionY, ballCoordinates);
  let lastIntersect = undefined;
  while(intersectionData.right < player2Box.left && isStarted && ballDirection.x > 0) {
    lastIntersect = intersectionData;
    ballDirectionY = -ballDirectionY;
    ballCoordinates = {right:{x:intersectionData.right}, 
                      top:{y:intersectionData.top},
                      bottom:{y:intersectionData.bottom}                      
  }
    intersectionData = getIntersection(ballDirectionY,ballCoordinates);
  }
  return {ballCoords:lastIntersect, ballDirectionY:ballDirectionY};
}

//calculate direction and duration
function calculateDirection() {
  let player2 = document.getElementById('player2');
  let paddleSize = player2.offsetHeight;
  let player2Box = player2.getBoundingClientRect();
  let paddleY = (player2Box.top + player2Box.bottom) / 2;
  let lastIntersectData = getLastBounce();
  if(lastIntersectData.ballCoords == undefined) {
    let ballCoordinates = getBallCoodinates();
    let ballData = {right:ballCoordinates.right.x, top:ballCoordinates.top.y, bottom: ballCoordinates.bottom.y};
    let y = getBallIntersectWithPaddle(ballData, ballDirection.y);
    let inaccuracySign = (Math.random() < .5) ? -1 : 1;
    let randomVal = getRandomVal(1, 0);
    let accuracyPenalty = randomVal > accuracy ? paddleSize*inaccuracySign : 0;
    let distance = y - paddleY + accuracyPenalty;
    let direction = (distance < 0) ? 'up': 'down';
    let ticks = Math.floor(Math.abs(distance / gameSpeed));
    return {direction:direction, ticks:ticks};
  }
  else {
    let y = getBallIntersectWithPaddle(lastIntersectData.ballCoords, lastIntersectData.ballDirectionY);
    let inaccuracySign = (Math.random() < .5) ? -1 : 1;
    let randomVal = getRandomVal(1, 0);
    let accuracyPenalty = randomVal > accuracy ? paddleSize*inaccuracySign : 0;
    let distance = y - paddleY + accuracyPenalty;
    let direction = (distance < 0) ? 'up': 'down';
    let ticks = Math.floor(Math.abs(distance / gameSpeed));
    return {direction:direction, ticks:ticks};
  }
}

function ballPassedPaddle() {
  let ballCoordinates = getBallCoodinates();
  let paddle = document.getElementById('player2');
  let paddleBox = paddle.getBoundingClientRect();
  if(paddleBox.right < ballCoordinates.left.x) {
    return true;
  }
  return false;
}


function startCPU() {
  let hasPredicted = false;
  setAccuracy();
  console.log(accuracy);
  // let checkIfMissed = setInterval(function() {
  //   if(ballPassedPaddle()) {
  //     hasPredicted = false;
  //   }
  //   if(!isStarted) {
  //     clearInterval(checkIfMissed);
  //   }
  // }, 10);

  let sleeping = false;
  let refreshId = setInterval(async function() {
    if(!isStarted) {
      clearInterval(refreshId);
      return;
    }
    if(isMoving||sleeping||isPaused) return;
    if(ballDirection.x < 0 || ballPassedPaddle()) {
      hasPredicted = false;
      return;
    }
    if(hasPredicted) return;

    let reactionTime = getRandomInt(5000*(1-accuracy),250);
    sleeping = true;
    console.log('sleeping: ' + reactionTime);
    await sleep(reactionTime);
    if(!isStarted) return;
    sleeping = false;
    hasPredicted = true;
    let directionData = calculateDirection();
    console.log(directionData);
    cpuMove(directionData.direction, directionData.ticks);
    
  }, 10);
}


