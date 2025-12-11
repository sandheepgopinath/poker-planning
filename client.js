// Socket.io connection
const socket = io();

// State management
let state = {
    sessionCode: null,
    playerName: null,
    isAdmin: false,
    players: [],
    cardValues: ['1', '2', '3', '5', '8', '13', '21', '34', '55'],
    currentVote: null,
    estimating: false,
    revealed: false
};

// DOM Elements - Landing Page
const landingPage = document.getElementById('landing-page');
const planningPage = document.getElementById('planning-page');
const adminNameInput = document.getElementById('admin-name-input');
const createSessionBtn = document.getElementById('create-session-btn');
const sessionCodeInput = document.getElementById('session-code-input');
const playerNameInput = document.getElementById('player-name-input');
const joinSessionBtn = document.getElementById('join-session-btn');


// DOM Elements - Planning Page
const sessionCodeDisplay = document.getElementById('session-code-display');
const adminControls = document.getElementById('admin-controls');
const copyLinkBtn = document.getElementById('copy-link-btn');
const startEstimationBtn = document.getElementById('start-estimation-btn');
const revealCardsBtn = document.getElementById('reveal-cards-btn');
const estimateAgainBtn = document.getElementById('estimate-again-btn');
const configCardsBtn = document.getElementById('config-cards-btn');
const playersGrid = document.getElementById('players-grid');
const votingSection = document.getElementById('voting-section');
const cardsContainer = document.getElementById('cards-container');
const resultsSection = document.getElementById('results-section');
const averageDisplay = document.getElementById('average-display');


// DOM Elements - Modal
const configModal = document.getElementById('config-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cardValuesList = document.getElementById('card-values-list');
const newCardValueInput = document.getElementById('new-card-value-input');
const addCardBtn = document.getElementById('add-card-btn');
const saveCardsBtn = document.getElementById('save-cards-btn');
const presetFibonacciBtn = document.getElementById('preset-fibonacci-btn');
const presetTshirtBtn = document.getElementById('preset-tshirt-btn');
const presetPowersBtn = document.getElementById('preset-powers-btn');

// DOM Elements - Toast
const errorToast = document.getElementById('error-toast');

// Event Listeners - Landing Page
createSessionBtn.addEventListener('click', () => {
    const name = adminNameInput.value.trim();
    if (!name) {
        showError('Please enter your name');
        return;
    }
    socket.emit('createSession', name);
    state.playerName = name;
});

joinSessionBtn.addEventListener('click', () => {
    const code = sessionCodeInput.value.trim().toUpperCase();
    const name = playerNameInput.value.trim();

    if (!code || code.length !== 5) {
        showError('Please enter a valid 5-character session code');
        return;
    }

    if (!name) {
        showError('Please enter your name');
        return;
    }

    socket.emit('joinSession', { sessionCode: code, playerName: name });
    state.playerName = name;
});

// Allow Enter key to submit
adminNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createSessionBtn.click();
});

sessionCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinSessionBtn.click();
});

playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinSessionBtn.click();
});

// Auto-uppercase session code input
sessionCodeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});

// Event Listeners - Planning Page
startEstimationBtn.addEventListener('click', () => {
    socket.emit('startEstimation', state.sessionCode);
});


revealCardsBtn.addEventListener('click', () => {
    socket.emit('revealCards', state.sessionCode);
});

estimateAgainBtn.addEventListener('click', () => {
    socket.emit('estimateAgain', state.sessionCode);
});

copyLinkBtn.addEventListener('click', () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?session=${state.sessionCode}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        // Show success feedback
        const originalText = copyLinkBtn.innerHTML;
        copyLinkBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
        `;
        copyLinkBtn.style.background = 'var(--accent-gradient)';

        setTimeout(() => {
            copyLinkBtn.innerHTML = originalText;
            copyLinkBtn.style.background = '';
        }, 2000);
    }).catch(() => {
        showError('Failed to copy link');
    });
});

configCardsBtn.addEventListener('click', () => {
    openConfigModal();
});


// Event Listeners - Modal
closeModalBtn.addEventListener('click', () => {
    closeConfigModal();
});

configModal.addEventListener('click', (e) => {
    if (e.target === configModal) {
        closeConfigModal();
    }
});

addCardBtn.addEventListener('click', () => {
    const value = newCardValueInput.value.trim();
    if (value && !state.cardValues.includes(value)) {
        state.cardValues.push(value);
        renderCardValuesList();
        newCardValueInput.value = '';
    }
});

newCardValueInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCardBtn.click();
});

saveCardsBtn.addEventListener('click', () => {
    if (state.cardValues.length === 0) {
        showError('Please add at least one card value');
        return;
    }
    socket.emit('updateCardValues', {
        sessionCode: state.sessionCode,
        cardValues: state.cardValues
    });
    closeConfigModal();
});

// Preset buttons
presetFibonacciBtn.addEventListener('click', () => {
    state.cardValues = ['1', '2', '3', '5', '8', '13', '21', '34', '55'];
    renderCardValuesList();
});

presetTshirtBtn.addEventListener('click', () => {
    state.cardValues = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    renderCardValuesList();
});

presetPowersBtn.addEventListener('click', () => {
    state.cardValues = ['1', '2', '4', '8', '16', '32', '64'];
    renderCardValuesList();
});

// Socket Event Handlers
socket.on('sessionCreated', (data) => {
    state.sessionCode = data.sessionCode;
    state.isAdmin = data.isAdmin;
    state.players = data.players;
    state.cardValues = data.cardValues;

    switchToPlanning();
});

socket.on('sessionJoined', (data) => {
    state.sessionCode = data.sessionCode;
    state.isAdmin = data.isAdmin;
    state.players = data.players;
    state.cardValues = data.cardValues;
    state.estimating = data.estimating;
    state.revealed = data.revealed;

    switchToPlanning();

    if (state.estimating && !state.revealed) {
        showVotingSection();
    }
});

socket.on('playerJoined', (data) => {
    state.players = data.players;
    renderPlayers();
});

socket.on('playerLeft', (data) => {
    state.players = data.players;
    renderPlayers();
});

socket.on('newAdmin', (data) => {
    const myPlayerId = socket.id;
    state.isAdmin = myPlayerId === data.adminId;
    updateAdminControls();
});

socket.on('cardValuesUpdated', (data) => {
    state.cardValues = data.cardValues;
    if (state.estimating && !state.revealed) {
        renderVotingCards();
    }
});

socket.on('estimationStarted', (data) => {
    state.players = data.players;
    state.estimating = true;
    state.revealed = false;
    state.currentVote = null;

    showVotingSection();
    renderPlayers();

    if (state.isAdmin) {
        startEstimationBtn.style.display = 'none';
        revealCardsBtn.style.display = 'inline-flex';
        estimateAgainBtn.style.display = 'none';
    }
});

socket.on('voteSubmitted', (data) => {
    // Update players with vote status (but not actual votes)
    state.players = state.players.map(player => {
        const updatedPlayer = data.players.find(p => p.id === player.id);
        return {
            ...player,
            hasVoted: updatedPlayer ? updatedPlayer.hasVoted : false
        };
    });
    renderPlayers();
});

socket.on('cardsRevealed', (data) => {
    state.players = data.players;
    state.revealed = true;

    // Keep voting section visible so users can change votes
    renderPlayers();
    showResults(data.average);

    if (state.isAdmin) {
        revealCardsBtn.style.display = 'none';
        estimateAgainBtn.style.display = 'inline-flex';
    }
});

socket.on('estimationReset', (data) => {
    state.players = data.players;
    state.estimating = false;
    state.revealed = false;
    state.currentVote = null;

    hideVotingSection();
    hideResults();
    renderPlayers();

    if (state.isAdmin) {
        startEstimationBtn.style.display = 'inline-flex';
        revealCardsBtn.style.display = 'none';
        estimateAgainBtn.style.display = 'none';
    }
});

socket.on('error', (message) => {
    showError(message);
});

// UI Functions
function switchToPlanning() {
    landingPage.classList.remove('active');
    planningPage.classList.add('active');

    sessionCodeDisplay.textContent = state.sessionCode;

    if (state.isAdmin) {
        adminControls.style.display = 'flex';
    }

    renderPlayers();
}

function renderPlayers() {
    playersGrid.innerHTML = '';

    const playerCount = state.players.length;

    state.players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';

        // Calculate circular position
        // Start from top (270 degrees) and distribute evenly
        const angleStep = 360 / playerCount;
        const angle = (270 + (index * angleStep)) * (Math.PI / 180); // Convert to radians

        // Table dimensions (relative to poker-table container)
        const radiusX = 42; // Horizontal radius percentage
        const radiusY = 38; // Vertical radius percentage

        // Calculate position (center is 50%, 50%)
        const x = 50 + radiusX * Math.cos(angle);
        const y = 50 + radiusY * Math.sin(angle);

        // Position the card
        playerCard.style.left = `${x}%`;
        playerCard.style.top = `${y}%`;
        playerCard.style.transform = 'translate(-50%, -50%)';
        playerCard.style.zIndex = index + 1;

        // Check if this player is admin
        const isPlayerAdmin = state.players[0]?.id === player.id;
        if (isPlayerAdmin) {
            playerCard.classList.add('admin');
        }

        // Check if player has voted
        if (state.estimating && !state.revealed && (player.vote !== null || player.hasVoted)) {
            playerCard.classList.add('voted');
        }

        const playerName = document.createElement('div');
        playerName.className = 'player-name';
        playerName.textContent = player.name;

        const playerVote = document.createElement('div');
        playerVote.className = 'player-vote';

        if (state.revealed && player.vote !== null) {
            // Show actual vote
            playerVote.textContent = player.vote;
        } else if (state.estimating && (player.vote !== null || player.hasVoted)) {
            // Show card back
            const cardBack = document.createElement('div');
            cardBack.className = 'vote-card-back';
            cardBack.textContent = '?';
            playerVote.appendChild(cardBack);
            playerVote.classList.remove('hidden');
        } else {
            // No vote yet
            playerVote.textContent = state.estimating ? 'Waiting...' : '-';
            playerVote.classList.add('hidden');
        }

        playerCard.appendChild(playerName);
        playerCard.appendChild(playerVote);
        playersGrid.appendChild(playerCard);
    });
}

function showVotingSection() {
    votingSection.style.display = 'block';
    renderVotingCards();
}

function hideVotingSection() {
    votingSection.style.display = 'none';
}

function renderVotingCards() {
    cardsContainer.innerHTML = '';

    state.cardValues.forEach(value => {
        const card = document.createElement('div');
        card.className = 'vote-card';

        if (state.currentVote === value) {
            card.classList.add('selected');
        }

        const cardValue = document.createElement('span');
        cardValue.textContent = value;
        card.appendChild(cardValue);

        card.addEventListener('click', () => {
            state.currentVote = value;
            socket.emit('submitVote', {
                sessionCode: state.sessionCode,
                vote: value
            });
            renderVotingCards();
        });

        cardsContainer.appendChild(card);
    });
}

function showResults(average) {
    resultsSection.style.display = 'block';

    if (average !== null) {
        averageDisplay.innerHTML = `
      <div class="average-label">Average Estimate</div>
      <div class="average-value">${average}</div>
    `;
    } else {
        averageDisplay.innerHTML = `
      <div class="average-label">No numeric votes to calculate average</div>
    `;
    }
}

function hideResults() {
    resultsSection.style.display = 'none';
}

function updateAdminControls() {
    if (state.isAdmin) {
        adminControls.style.display = 'flex';
    } else {
        adminControls.style.display = 'none';
    }
}

function openConfigModal() {
    configModal.classList.add('active');
    renderCardValuesList();
}

function closeConfigModal() {
    configModal.classList.remove('active');
}

function renderCardValuesList() {
    cardValuesList.innerHTML = '';

    state.cardValues.forEach((value, index) => {
        const item = document.createElement('div');
        item.className = 'card-value-item';

        const valueText = document.createElement('span');
        valueText.textContent = value;

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => {
            state.cardValues.splice(index, 1);
            renderCardValuesList();
        });

        item.appendChild(valueText);
        item.appendChild(removeBtn);
        cardValuesList.appendChild(item);
    });
}

function showError(message) {
    errorToast.textContent = message;
    errorToast.classList.add('show');

    setTimeout(() => {
        errorToast.classList.remove('show');
    }, 3000);
}

// Check URL parameters on page load
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionParam = urlParams.get('session');

    if (sessionParam) {
        // Auto-populate the session code input
        sessionCodeInput.value = sessionParam.toUpperCase();

        // Focus on the player name input for convenience
        playerNameInput.focus();

        // Scroll to the join session card
        document.getElementById('join-session-card').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
});

