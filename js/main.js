const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const canvas2 = document.getElementById('preview');
const context2 = canvas2.getContext('2d');

const canvas3 = document.getElementById('preview2');
const context3 = canvas3.getContext('2d');

context.scale(20, 20);
context2.scale(30, 30);
context3.scale(30, 30);

const arena = createMatrix(12, 20);
const arena2 = createMatrix(5, 5);
const arena3 = createMatrix(5, 5);

const player = {
  pos: {x : 0, y : 0},
  matrix_current: null,
  matrix_next: null,
  matrix_next_type: null,
  matrix_2steps_ahead: null,
  matrix_2steps_ahead_type: null,
  score: 0
}

const colors = [
  null,
  '#55efc4',
  '#00cec9',
  '#0984e3',
  '#d63031',
  '#fdcb6e',
  '#6c5ce7',
  '#e17055'
]

let themeMusic = new Audio("/audio/Majesty.mp3");
themeMusic.volume = 0.07;
themeMusic.loop = true;
themeMusic.play();

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const pieces = 'IJLOTSZ';
player.matrix_2steps_ahead_type = pieces[pieces.length * Math.random() | 0];
player.matrix_2steps_ahead = createPiece(player.matrix_2steps_ahead_type);
player.matrix_next_type = pieces[pieces.length * Math.random() | 0];
player.matrix_next = createPiece(player.matrix_next_type);

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === 'T') {
    return [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0]
    ];
  } else if (type === 'I') {
    return [
      [0, 6, 0, 0],
      [0, 6, 0, 0],
      [0, 6, 0, 0],
      [0, 6, 0, 0]
    ];
  } else if (type === 'S') {
    return [
      [0, 5, 5],
      [5, 5, 0],
      [0 ,0 ,0]
    ];
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ];
  } else if (type === 'O') {
    return [
      [2, 2],
      [2, 2]
    ];
  } else if (type === 'J') {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0]
    ];
  } else if (type === 'L') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3]
    ];
  }
}

function draw() {
  context.fillStyle = 'black';
  context.fillRect(0,0,canvas.width, canvas.height);

  context2.fillStyle = 'black';
  context2.fillRect(0,0,canvas2.width, canvas2.height);

  context3.fillStyle = 'black';
  context3.fillRect(0,0,canvas3.width, canvas3.height);

  drawMatrix('context', arena, {x : 0, y : 0});
  drawMatrix('context', player.matrix_current, player.pos);

  drawMatrix('context2', arena2, {x : 0, y : 0});
  if ('TSZ'.includes(player.matrix_next_type)) {
    drawMatrix('context2', player.matrix_next, {x: 1, y: 1.5});
  } else if (player.matrix_next_type === 'I') {
    drawMatrix('context2', player.matrix_next, {x: 1, y: 0.5});
  } else if (player.matrix_next_type === 'O') {
    drawMatrix('context2', player.matrix_next, {x: 1.5, y: 1.5});
  } else if (player.matrix_next_type === 'J') {
    drawMatrix('context2', player.matrix_next, {x: 1.5, y: 1});
  } else if (player.matrix_next_type === 'L') {
    drawMatrix('context2', player.matrix_next, {x: 0.5, y: 1});
  }

  drawMatrix('context3', arena3, {x : 0, y : 0});
  if ('TSZ'.includes(player.matrix_2steps_ahead_type)) {
    drawMatrix('context3', player.matrix_2steps_ahead, {x: 1, y: 1.5});
  } else if (player.matrix_2steps_ahead_type === 'I') {
    drawMatrix('context3', player.matrix_2steps_ahead, {x: 1, y: 0.5});
  } else if (player.matrix_2steps_ahead_type === 'O') {
    drawMatrix('context3', player.matrix_2steps_ahead, {x: 1.5, y: 1.5});
  } else if (player.matrix_2steps_ahead_type === 'J') {
    drawMatrix('context3', player.matrix_2steps_ahead, {x: 1.5, y: 1});
  } else if (player.matrix_2steps_ahead_type === 'L') {
    drawMatrix('context3', player.matrix_2steps_ahead, {x: 0.5, y: 1});
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function update(time = 0) {
  let deltaTime = time - lastTime;
  lastTime = time;
  
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

function drawMatrix(context_type, matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        if (context_type === "context") {
          context.fillStyle = colors[value];
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
        } else if (context_type === "context2") {
          context2.fillStyle = colors[value];
          context2.fillRect(x + offset.x, y + offset.y, 1, 1);
        } else if (context_type === "context3") {
          context3.fillStyle = colors[value];
          context3.fillRect(x + offset.x, y + offset.y, 1, 1);
        }        
      }
    });
  });
}

function merge(arena, player) {
  player.matrix_current.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix_current;
  const o = player.pos;
  
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix_current, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    
    if (offset > player.matrix_current[0].length) {
      rotate(player.matrix_current, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [ matrix[x][y], matrix[y][x] ] = [ matrix[y][x], matrix[x][y] ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerReset() {
  player.matrix_current = player.matrix_next;
  player.matrix_next = player.matrix_2steps_ahead;
  player.matrix_next_type = player.matrix_2steps_ahead_type;
  player.matrix_2steps_ahead_type = pieces[pieces.length * Math.random() | 0];
  player.matrix_2steps_ahead = createPiece(player.matrix_2steps_ahead_type);

  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix_current[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }              
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
  let key = event.keyCode;
  if (key === 37) {
    playerMove(-1);
  } else if (key === 39) {
    playerMove(1);
  } else if (key === 40) {
    playerDrop();
  } else if (key === 38) {
    playerRotate(1);
  }
});

playerReset();
updateScore();
update();

// Add sounds for row clear
// Make figures spawn randomly rotated