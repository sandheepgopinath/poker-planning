const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Session storage (in-memory for simplicity)
const sessions = new Map();

// Generate random 5-character alphanumeric code
function generateSessionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    if (sessions.has(code)) {
        return generateSessionCode();
    }
    return code;
}

// Calculate average (only for numeric votes)
function calculateAverage(votes) {
    const numericVotes = votes.filter(v => !isNaN(parseFloat(v.vote)) && isFinite(v.vote));
    if (numericVotes.length === 0) return null;
    const sum = numericVotes.reduce((acc, v) => acc + parseFloat(v.vote), 0);
    return (sum / numericVotes.length).toFixed(1);
}

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Create new session
    socket.on('createSession', ({ playerName, sessionName }) => {
        const sessionCode = generateSessionCode();
        const session = {
            code: sessionCode,
            name: sessionName || 'Planning Session',
            admin: socket.id,
            players: [{
                id: socket.id,
                name: playerName,
                vote: null
            }],
            cardValues: ['1', '2', '3', '5', '8', '13', '21', '34', '55'], // Default Fibonacci
            estimating: false,
            revealed: false,
            history: [],
            currentStory: null
        };

        sessions.set(sessionCode, session);
        socket.join(sessionCode);
        socket.sessionCode = sessionCode;

        socket.emit('sessionCreated', {
            sessionCode,
            sessionName: session.name,
            isAdmin: true,
            players: session.players,
            cardValues: session.cardValues,
            history: session.history
        });

        console.log(`Session created: ${sessionCode} by ${playerName}`);
    });

    // Join existing session
    socket.on('joinSession', ({ sessionCode, playerName }) => {
        const session = sessions.get(sessionCode);

        if (!session) {
            socket.emit('error', 'Session not found');
            return;
        }

        // Check if player already exists
        const existingPlayer = session.players.find(p => p.name === playerName);
        if (existingPlayer) {
            socket.emit('error', 'Player name already taken');
            return;
        }

        const player = {
            id: socket.id,
            name: playerName,
            vote: null
        };

        session.players.push(player);
        socket.join(sessionCode);
        socket.sessionCode = sessionCode;

        socket.emit('sessionJoined', {
            sessionCode,
            sessionName: session.name,
            isAdmin: socket.id === session.admin,
            players: session.players,
            cardValues: session.cardValues,
            estimating: session.estimating,
            revealed: session.revealed,
            history: session.history,
            currentStory: session.currentStory
        });

        // Notify all players in session
        io.to(sessionCode).emit('playerJoined', {
            players: session.players
        });

        console.log(`${playerName} joined session: ${sessionCode}`);
    });

    // Update card configuration (admin only)
    socket.on('updateCardValues', ({ sessionCode, cardValues }) => {
        const session = sessions.get(sessionCode);

        if (!session) {
            socket.emit('error', 'Session not found');
            return;
        }

        if (socket.id !== session.admin) {
            socket.emit('error', 'Only admin can update card values');
            return;
        }

        session.cardValues = cardValues;

        // Notify all players
        io.to(sessionCode).emit('cardValuesUpdated', {
            cardValues: session.cardValues
        });

        console.log(`Card values updated in session ${sessionCode}`);
    });

    // Start estimation round (admin only)
    socket.on('startEstimation', ({ sessionCode, storyName }) => {
        const session = sessions.get(sessionCode);

        if (!session) {
            socket.emit('error', 'Session not found');
            return;
        }

        if (socket.id !== session.admin) {
            socket.emit('error', 'Only admin can start estimation');
            return;
        }

        // Reset votes
        session.players.forEach(p => p.vote = null);
        session.estimating = true;
        session.revealed = false;
        session.currentStory = storyName || 'Untitled Story';

        // Notify all players
        io.to(sessionCode).emit('estimationStarted', {
            players: session.players,
            currentStory: session.currentStory
        });

        console.log(`Estimation started in session ${sessionCode}: ${session.currentStory}`);
    });

    // Submit vote
    socket.on('submitVote', ({ sessionCode, vote }) => {
        const session = sessions.get(sessionCode);

        if (!session) {
            socket.emit('error', 'Session not found');
            return;
        }

        if (!session.estimating) {
            socket.emit('error', 'Estimation not in progress');
            return;
        }

        const player = session.players.find(p => p.id === socket.id);
        if (player) {
            player.vote = vote;

            // If cards are revealed, broadcast full update with new average
            if (session.revealed) {
                const average = calculateAverage(session.players.filter(p => p.vote !== null));
                io.to(sessionCode).emit('cardsRevealed', {
                    players: session.players,
                    average
                });
            } else {
                // Notify all players (but don't reveal votes yet)
                io.to(sessionCode).emit('voteSubmitted', {
                    players: session.players.map(p => ({
                        id: p.id,
                        name: p.name,
                        hasVoted: p.vote !== null
                    }))
                });
            }

            console.log(`${player.name} voted in session ${sessionCode}`);
        }
    });

    // Reveal cards (admin only)
    socket.on('revealCards', (sessionCode) => {
        const session = sessions.get(sessionCode);

        if (!session) {
            socket.emit('error', 'Session not found');
            return;
        }

        if (socket.id !== session.admin) {
            socket.emit('error', 'Only admin can reveal cards');
            return;
        }

        session.revealed = true;
        const average = calculateAverage(session.players.filter(p => p.vote !== null));

        // Notify all players with full vote details
        io.to(sessionCode).emit('cardsRevealed', {
            players: session.players,
            average
        });

        console.log(`Cards revealed in session ${sessionCode}`);
    });

    // Reset for new estimation (admin only)
    socket.on('estimateAgain', (sessionCode) => {
        const session = sessions.get(sessionCode);

        if (!session) {
            socket.emit('error', 'Session not found');
            return;
        }

        if (socket.id !== session.admin) {
            socket.emit('error', 'Only admin can reset estimation');
            return;
        }

        // Save current estimation to history if there were votes
        const votedPlayers = session.players.filter(p => p.vote !== null);
        if (votedPlayers.length > 0 && session.currentStory) {
            const average = calculateAverage(votedPlayers);
            const historyEntry = {
                storyName: session.currentStory,
                timestamp: new Date().toISOString(),
                votes: votedPlayers.map(p => ({
                    playerName: p.name,
                    vote: p.vote
                })),
                average: average
            };
            session.history.push(historyEntry);

            // Notify all players of history update
            io.to(sessionCode).emit('historyUpdated', {
                history: session.history
            });
        }

        // Reset votes
        session.players.forEach(p => p.vote = null);
        session.estimating = false;
        session.revealed = false;
        session.currentStory = null;

        // Notify all players
        io.to(sessionCode).emit('estimationReset', {
            players: session.players
        });

        console.log(`Estimation reset in session ${sessionCode}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        if (socket.sessionCode) {
            const session = sessions.get(socket.sessionCode);
            if (session) {
                // Remove player from session
                session.players = session.players.filter(p => p.id !== socket.id);

                // If admin left, assign new admin or delete session
                if (socket.id === session.admin) {
                    if (session.players.length > 0) {
                        session.admin = session.players[0].id;
                        io.to(socket.sessionCode).emit('newAdmin', {
                            adminId: session.admin
                        });
                    } else {
                        sessions.delete(socket.sessionCode);
                        console.log(`Session ${socket.sessionCode} deleted (no players left)`);
                        return;
                    }
                }

                // Notify remaining players
                io.to(socket.sessionCode).emit('playerLeft', {
                    players: session.players
                });
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
