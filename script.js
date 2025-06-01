// Menu elements
const mainMenu = document.getElementById('main-menu');
const subMenuPractica = document.getElementById('sub-menu-practica');
const appContainer = document.getElementById('app-container');
const settingsPanel = document.getElementById('settings-panel');

// Buttons and controls
const practiceButton = document.getElementById('practice-button');
const practice1v1Button = document.getElementById('practice-1v1-button');
const practice2v2Button = document.getElementById('practice-2v2-button');
const backToMainMenuButton = document.getElementById('back-to-main-menu-from-submenu-button');
const backToMenuButton = document.getElementById('back-to-menu-button');
const startRoundButton = document.getElementById('start-round-button');
const settingsButton = document.getElementById('settings-button');
const closeSettingsButton = document.getElementById('close-settings-button');

// Settings controls
const showNumbersCheckbox = document.getElementById('show-numbers-checkbox');
const highContrastCheckbox = document.getElementById('high-contrast-checkbox');
const helpEnabledCheckbox = document.getElementById('help-enabled-checkbox');

// Game elements
const dominoTable = document.getElementById('domino-table');
const playerHandBottom = document.getElementById('player-hand-bottom');
const playerHandTop = document.getElementById('player-hand-top');
const playerHandLeft = document.getElementById('player-hand-left');
const playerHandRight = document.getElementById('player-hand-right');
const gameMessages = document.getElementById('game-messages');

// Game state
let gameMode = null;
let currentPlayer = 0;
let players = [];
let dominoPieces = [];
let tablePieces = [];
let tableEnds = { left: null, right: null };
let gameStarted = false;
let showNumbers = false;
let tableGrid = [];
let centerPos = { row: 15, col: 15 };
let currentBranch = { direction: 'vertical', row: centerPos.row, col: centerPos.col };

// Settings event listeners
settingsButton.addEventListener('click', () => {
    settingsPanel.classList.add('active');
});

closeSettingsButton.addEventListener('click', () => {
    settingsPanel.classList.remove('active');
});

showNumbersCheckbox.addEventListener('change', (e) => {
    showNumbers = e.target.checked;
    if (gameStarted) {
        updateGameDisplay();
    }
});

highContrastCheckbox.addEventListener('change', (e) => {
    document.body.classList.toggle('contraste-alto', e.target.checked);
});

helpEnabledCheckbox.addEventListener('change', (e) => {
    // La lógica de ayuda se mantiene pero ahora se controla desde el panel de ajustes
    if (gameStarted) {
        updateGameDisplay();
    }
});

// Función para crear los puntos del dominó
function createDots(number) {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'dots-container';
    
    const dotPatterns = {
        0: [],
        1: [{top: '50%', left: '50%'}],
        2: [{top: '25%', left: '25%'}, {top: '75%', left: '75%'}],
        3: [{top: '25%', left: '25%'}, {top: '50%', left: '50%'}, {top: '75%', left: '75%'}],
        4: [{top: '25%', left: '25%'}, {top: '25%', left: '75%'}, 
            {top: '75%', left: '25%'}, {top: '75%', left: '75%'}],
        5: [{top: '25%', left: '25%'}, {top: '25%', left: '75%'}, 
            {top: '50%', left: '50%'},
            {top: '75%', left: '25%'}, {top: '75%', left: '75%'}],
        6: [{top: '25%', left: '25%'}, {top: '25%', left: '75%'},
            {top: '50%', left: '25%'}, {top: '50%', left: '75%'},
            {top: '75%', left: '25%'}, {top: '75%', left: '75%'}],
        7: [{top: '25%', left: '25%'}, {top: '25%', left: '75%'},
            {top: '50%', left: '25%'}, {top: '50%', left: '50%'}, {top: '50%', left: '75%'},
            {top: '75%', left: '25%'}, {top: '75%', left: '75%'}],
        8: [{top: '25%', left: '25%'}, {top: '25%', left: '50%'}, {top: '25%', left: '75%'},
            {top: '50%', left: '25%'}, {top: '50%', left: '75%'},
            {top: '75%', left: '25%'}, {top: '75%', left: '50%'}, {top: '75%', left: '75%'}],
        9: [{top: '25%', left: '25%'}, {top: '25%', left: '50%'}, {top: '25%', left: '75%'},
            {top: '50%', left: '25%'}, {top: '50%', left: '50%'}, {top: '50%', left: '75%'},
            {top: '75%', left: '25%'}, {top: '75%', left: '50%'}, {top: '75%', left: '75%'}]
    };

    dotPatterns[number].forEach(position => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.top = position.top;
        dot.style.left = position.left;
        dotsContainer.appendChild(dot);
    });

    return dotsContainer;
}

function isDouble(piece) {
    return piece.left === piece.right;
}

function getNextPosition(currentPos, direction) {
    const pos = { ...currentPos };
    switch (direction) {
        case 'vertical':
            pos.row += 1;
            break;
        case 'horizontal':
            pos.col += 1;
            break;
    }
    return pos;
}

function shouldChangeBranchDirection(pos) {
    const margin = 3;
    return pos.col <= margin || pos.col >= 30 - margin || pos.row <= margin || pos.row >= 30 - margin;
}

function getNewBranchDirection(currentDirection) {
    return currentDirection === 'vertical' ? 'horizontal' : 'vertical';
}

// Create all domino pieces (double 9)
function createDominoPieces() {
    dominoPieces = [];
    for (let i = 0; i <= 9; i++) {
        for (let j = i; j <= 9; j++) {
            dominoPieces.push({ left: i, right: j });
        }
    }
}

// Shuffle array using Fisher-Yates algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Deal pieces to players
function dealPieces() {
    const numPlayers = gameMode === '1v1' ? 2 : 4;
    const piecesPerPlayer = 10;
    players = Array(numPlayers).fill().map(() => []);
    
    shuffle(dominoPieces);
    
    for (let i = 0; i < piecesPerPlayer; i++) {
        for (let j = 0; j < numPlayers; j++) {
            if (dominoPieces.length > 0) {
                players[j].push(dominoPieces.pop());
            }
        }
    }
}

// Create visual representation of a domino piece
function createDominoPiece(piece, index, isPlayable = false) {
    const div = document.createElement('div');
    div.className = `ficha-domino${isPlayable && helpEnabledCheckbox.checked ? ' ficha-jugable' : ''}`;
    
    const topHalf = document.createElement('div');
    topHalf.className = 'ficha-mitad top';
    const bottomHalf = document.createElement('div');
    bottomHalf.className = 'ficha-mitad bottom';

    if (piece.left === '?' && piece.right === '?') {
        div.className += ' ficha-oculta';
    } else {
        if (showNumbers) {
            topHalf.textContent = piece.left;
            bottomHalf.textContent = piece.right;
        } else {
            topHalf.appendChild(createDots(piece.left));
            bottomHalf.appendChild(createDots(piece.right));
        }
    }

    div.appendChild(topHalf);
    div.appendChild(bottomHalf);
    
    if (isPlayable) {
        div.onclick = () => playPiece(index);
    }
    
    return div;
}

// Check if a piece can be played
function canPlayPiece(piece) {
    if (tableEnds.left === null) return true;
    return piece.left === tableEnds.left || 
           piece.right === tableEnds.left ||
           piece.left === tableEnds.right || 
           piece.right === tableEnds.right;
}

// Play a piece
function playPiece(index) {
    const piece = players[currentPlayer][index];
    if (!canPlayPiece(piece)) return;
    
    const playedPiece = players[currentPlayer].splice(index, 1)[0];
    
    if (tableEnds.left === null) {
        tableEnds.left = playedPiece.left;
        tableEnds.right = playedPiece.right;
        
        const initialDirection = isDouble(playedPiece) ? 'vertical' : 'horizontal';
        tablePieces.push({ 
            piece: playedPiece,
            position: { row: centerPos.row, col: centerPos.col },
            direction: initialDirection,
            isDouble: isDouble(playedPiece)
        });
        
        currentBranch = {
            direction: initialDirection,
            row: centerPos.row,
            col: centerPos.col
        };
    } else {
        let newPos = getNextPosition(currentBranch, currentBranch.direction);
        
        if (shouldChangeBranchDirection(newPos)) {
            currentBranch.direction = getNewBranchDirection(currentBranch.direction);
            newPos = getNextPosition(currentBranch, currentBranch.direction);
        }
        
        currentBranch.row = newPos.row;
        currentBranch.col = newPos.col;
        
        const isVertical = currentBranch.direction === 'vertical';
        const pieceIsDouble = isDouble(playedPiece);
        
        tablePieces.push({
            piece: playedPiece,
            position: newPos,
            direction: pieceIsDouble ? (isVertical ? 'horizontal' : 'vertical') : currentBranch.direction,
            isDouble: pieceIsDouble
        });
        
        if (playedPiece.left === tableEnds.left) {
            tableEnds.left = playedPiece.right;
        } else if (playedPiece.right === tableEnds.left) {
            tableEnds.left = playedPiece.left;
        } else if (playedPiece.left === tableEnds.right) {
            tableEnds.right = playedPiece.right;
        } else if (playedPiece.right === tableEnds.right) {
            tableEnds.right = playedPiece.left;
        }
    }
    
    updateGameDisplay();
    nextTurn();
}

// Bot play logic
function botPlay() {
    const botPieces = players[currentPlayer];
    const playableIndex = botPieces.findIndex(piece => canPlayPiece(piece));
    
    if (playableIndex !== -1) {
        setTimeout(() => {
            playPiece(playableIndex);
        }, 1000);
    } else {
        setTimeout(() => {
            gameMessages.textContent = `Jugador ${currentPlayer + 1} pasa`;
            nextTurn();
        }, 1000);
    }
}

// Move to next turn
function nextTurn() {
    currentPlayer = (currentPlayer + 1) % players.length;
    if (currentPlayer !== 0) {
        botPlay();
    }
}

// Update game display
function updateGameDisplay() {
    playerHandBottom.innerHTML = '';
    playerHandTop.innerHTML = '';
    playerHandLeft.innerHTML = '';
    playerHandRight.innerHTML = '';
    dominoTable.innerHTML = '';
    
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-pieces';
    
    tablePieces.forEach((tablePiece) => {
        const pieceElement = createDominoPiece(tablePiece.piece, -1);
        pieceElement.className += ` ficha-${tablePiece.direction}`;
        pieceElement.style.gridRow = tablePiece.position.row;
        pieceElement.style.gridColumn = tablePiece.position.col;
        
        if (tablePiece.isDouble && tablePiece.direction === 'vertical') {
            pieceElement.style.transform = 'rotate(90deg)';
        }
        
        tableContainer.appendChild(pieceElement);
    });
    
    dominoTable.appendChild(tableContainer);
    
    players[0].forEach((piece, index) => {
        playerHandBottom.appendChild(
            createDominoPiece(piece, index, canPlayPiece(piece))
        );
    });
    
    const hiddenPiece = { left: '?', right: '?' };
    if (gameMode === '1v1') {
        players[1].forEach(() => {
            playerHandTop.appendChild(createDominoPiece(hiddenPiece, -1));
        });
    } else {
        players[1].forEach(() => {
            playerHandLeft.appendChild(createDominoPiece(hiddenPiece, -1));
        });
        players[2].forEach(() => {
            playerHandTop.appendChild(createDominoPiece(hiddenPiece, -1));
        });
        players[3].forEach(() => {
            playerHandRight.appendChild(createDominoPiece(hiddenPiece, -1));
        });
    }
}

// Initialize game
function initializeGame(mode) {
    gameMode = mode;
    gameStarted = true;
    createDominoPieces();
    dealPieces();
    currentPlayer = 0;
    tableEnds = { left: null, right: null };
    tablePieces = [];
    tableGrid = Array(30).fill().map(() => Array(30).fill(null));
    currentBranch = { direction: 'vertical', row: centerPos.row, col: centerPos.col };
    updateGameDisplay();
}

// Menu navigation
practiceButton.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    subMenuPractica.style.display = 'block';
});

backToMainMenuButton.addEventListener('click', () => {
    subMenuPractica.style.display = 'none';
    mainMenu.style.display = 'block';
});

// Game mode selection
practice1v1Button.addEventListener('click', () => {
    subMenuPractica.style.display = 'none';
    appContainer.style.display = 'block';
    initializeGame('1v1');
});

practice2v2Button.addEventListener('click', () => {
    subMenuPractica.style.display = 'none';
    appContainer.style.display = 'block';
    initializeGame('2v2');
});

backToMenuButton.addEventListener('click', () => {
    appContainer.style.display = 'none';
    mainMenu.style.display = 'block';
    gameStarted = false;
});

// Start new round
startRoundButton.addEventListener('click', () => {
    if (gameStarted) {
        
        initializeGame(gameMode);
    }
});