const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the frontend dist directory
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Store connected students: { socketId: nickname }
const students = {};
// Global game state
let gameStatus = 'waiting'; // 'waiting', 'playing'
let globalQuestionIndex = 0;
const studentScores = {}; // { socketId: score }

// Discussion state
let discussionStatus = 'waiting'; // 'waiting', 'discussing'
let currentDiscussionIndex = 0;
const discussionResponses = []; // Array of { nickname, text, questionIndex }

const QUIZ_DATA = [
    { question: '한국의 수도는?', options: ['서울', '부산', '인천', '대구'], answer: '서울' },
    { question: '미국의 수도는?', options: ['뉴욕', '워싱턴 D.C.', 'LA', '시카고'], answer: '워싱턴 D.C.' },
    { question: '일본의 수도는?', options: ['오사카', '도쿄', '교토', '후쿠오카'], answer: '도쿄' },
    { question: '중국의 수도는?', options: ['상하이', '베이징', '홍콩', '광저우'], answer: '베이징' },
    { question: '영국의 수도는?', options: ['맨체스터', '런던', '리버풀', '버밍엄'], answer: '런던' },
    { question: '프랑스의 수도는?', options: ['마르세유', '파리', '리옹', '니스'], answer: '파리' },
];

const DISCUSSION_QUESTIONS = [
    {
        question: "오늘 장애체험을 하면서 가장 놀라웠던 점은 무엇이었나요?",
        reason: "아이들이 스스로 느낀 ‘발견’을 말하게 하여 자연스러운 공감 형성."
    },
    {
        question: "불편함을 느꼈을 때, 어떤 도움이나 배려가 있으면 더 편했을 것 같나요?",
        reason: "‘불쌍함’이 아니라 환경적 배려와 접근성을 생각하게 한다."
    },
    {
        question: "우리 학교나 동네에서 장애가 있는 친구들에게 도움이 되려면 무엇을 바꿔야 할까요?",
        reason: "개인이 아닌 사회가 바뀌어야 한다는 관점을 익힐 수 있다."
    },
    {
        question: "만약 우리 반에 장애가 있는 친구가 같이 생활한다면, 우리는 어떤 친구가 되어줄 수 있을까요?",
        reason: "‘배려하는 관계’, ‘함께 생활하는 방식’을 스스로 상상하게 함."
    }
];

// Helper to broadcast scores (progress) to everyone
const broadcastScores = () => {
    io.emit('progressUpdate', studentScores);
};

// Helper to broadcast discussion state
const broadcastDiscussionState = () => {
    io.emit('discussionState', {
        status: discussionStatus,
        currentQuestionIndex: currentDiscussionIndex,
        currentQuestion: DISCUSSION_QUESTIONS[currentDiscussionIndex],
        responses: discussionResponses.filter(r => r.questionIndex === currentDiscussionIndex)
    });
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send current student list to the newly connected client
    socket.emit('studentListUpdate', Object.entries(students).map(([id, nickname]) => ({ id, nickname })));

    // Send current game status
    if (gameStatus === 'playing') {
        socket.emit('gameStarted');
        // If joining mid-game, send current question
        if (globalQuestionIndex < QUIZ_DATA.length) {
            const q = QUIZ_DATA[globalQuestionIndex];
            socket.emit('question', {
                question: q.question,
                options: q.options
            });
        }
    }

    // Send current discussion status
    if (discussionStatus === 'discussing') {
        socket.emit('discussionState', {
            status: discussionStatus,
            currentQuestionIndex: currentDiscussionIndex,
            currentQuestion: DISCUSSION_QUESTIONS[currentDiscussionIndex],
            responses: discussionResponses.filter(r => r.questionIndex === currentDiscussionIndex)
        });
    }

    socket.on('join', (nickname) => {
        students[socket.id] = nickname;
        studentScores[socket.id] = 0; // Initialize score
        console.log(`Student joined: ${nickname} (${socket.id})`);
        io.emit('studentListUpdate', Object.entries(students).map(([id, nickname]) => ({ id, nickname })));
        broadcastScores();

        // If game is already playing, let them join
        if (gameStatus === 'playing') {
            socket.emit('gameStarted');
            if (globalQuestionIndex < QUIZ_DATA.length) {
                const q = QUIZ_DATA[globalQuestionIndex];
                socket.emit('question', {
                    question: q.question,
                    options: q.options
                });
            }
        }

        // If discussion is active, send state
        if (discussionStatus === 'discussing') {
            socket.emit('discussionState', {
                status: discussionStatus,
                currentQuestionIndex: currentDiscussionIndex,
                currentQuestion: DISCUSSION_QUESTIONS[currentDiscussionIndex],
                responses: discussionResponses.filter(r => r.questionIndex === currentDiscussionIndex)
            });
        }
    });

    // --- Quiz Events ---
    socket.on('startQuiz', () => {
        gameStatus = 'playing';
        discussionStatus = 'waiting'; // Reset discussion if quiz starts
        globalQuestionIndex = 0;
        // Reset scores
        for (const id in students) {
            studentScores[id] = 0;
        }
        io.emit('gameStarted');
        broadcastScores();

        // Send first question to everyone
        if (QUIZ_DATA.length > 0) {
            const q = QUIZ_DATA[0];
            io.emit('question', {
                question: q.question,
                options: q.options
            });
        }
    });

    socket.on('submitAnswer', ({ answer }) => {
        if (globalQuestionIndex >= QUIZ_DATA.length) return; // Already finished

        const currentQuestion = QUIZ_DATA[globalQuestionIndex];

        if (answer === currentQuestion.answer) {
            // Correct! 
            // 1. Give point to this student
            studentScores[socket.id] = (studentScores[socket.id] || 0) + 1;
            socket.emit('correct'); // Tell winner they were correct

            // 2. Advance game for EVERYONE
            globalQuestionIndex++;
            broadcastScores(); // Update tracks

            if (globalQuestionIndex >= QUIZ_DATA.length) {
                io.emit('finished');
            } else {
                // Send next question to EVERYONE
                const nextQ = QUIZ_DATA[globalQuestionIndex];
                io.emit('question', {
                    question: nextQ.question,
                    options: nextQ.options
                });
            }
        } else {
            socket.emit('incorrect');
        }
    });

    socket.on('getQuestion', () => {
        // In speed mode, questions are pushed, but if a client requests it (e.g. on reconnect), send current
        if (globalQuestionIndex < QUIZ_DATA.length) {
            const q = QUIZ_DATA[globalQuestionIndex];
            socket.emit('question', {
                question: q.question,
                options: q.options
            });
        } else if (gameStatus === 'playing') {
            socket.emit('finished');
        }
    });

    // --- Discussion Events ---
    socket.on('startDiscussion', () => {
        discussionStatus = 'discussing';
        gameStatus = 'waiting'; // Reset quiz if discussion starts
        currentDiscussionIndex = 0;
        discussionResponses.length = 0; // Clear previous responses
        broadcastDiscussionState();
    });

    socket.on('nextDiscussionQuestion', () => {
        if (currentDiscussionIndex < DISCUSSION_QUESTIONS.length - 1) {
            currentDiscussionIndex++;
            broadcastDiscussionState();
        } else {
            discussionStatus = 'finished';
            broadcastDiscussionState();
        }
    });

    socket.on('submitDiscussion', ({ text }) => {
        const nickname = students[socket.id] || 'Unknown';
        const response = {
            nickname,
            text,
            questionIndex: currentDiscussionIndex,
            timestamp: Date.now()
        };
        discussionResponses.push(response);
        broadcastDiscussionState();
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (students[socket.id]) {
            delete students[socket.id];
            delete studentScores[socket.id];
            io.emit('studentListUpdate', Object.entries(students).map(([id, nickname]) => ({ id, nickname })));
            broadcastScores();
        }
    });
});

// Handle SPA routing, return index.html for all non-api routes
app.use((req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} `);
});
