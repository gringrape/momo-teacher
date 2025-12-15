const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the frontend dist directory
// Serve static files from the local public directory
const frontendDistPath = path.join(__dirname, 'public');
app.use(express.static(frontendDistPath));

// Store connected students: { socketId: nickname }
const students = {};
// Global game state
let gameStatus = 'waiting'; // 'waiting', 'playing'
// let globalQuestionIndex = 0; // Removed for individual progress
const studentScores = {}; // { socketId: score }

// Discussion state
let discussionStatus = 'waiting'; // 'waiting', 'discussing'
let currentDiscussionIndex = 0;
const discussionResponses = []; // Array of { nickname, text, questionIndex }

const QUIZ_DATA = [
    { question: '장애인 화장실을 이용할때 가장 편한 문은?', options: ['폴딩도어', '앞으로 여는 문', '옆으로 미는문', '자동문'], answer: '자동문' },
    { question: '무엇을 타고 접근성조사를 하면 좋을까요??', options: ['회전의자', '자동차', '휠체어', '자전거'], answer: '휠체어' },
    { question: '휠체어이용자가 휠체어에서 변기로 이동할때 필요한것은?', options: ['안전손잡이', '지팡이', '발판', '목발'], answer: '안전손잡이' },
    { question: '화장실 크기를 잴때 사용 하는것은?', options: ['줄자', '휠체어', '셀카봉', '가방'], answer: '줄자' },
    { question: '장애인화장실의 가로X세로 최소면적은?', options: ['1M', '2M', '1.5M', '2M'], answer: '1.5M' },
    { question: '엘리베이터가 가장 필요한 사람은?', options: ['학부모', '담임선생님', '휠체어이용자', '교장선생님'], answer: '휠체어이용자' },
    { question: '휠체어를 타고 이동할때 장애물은?', options: ['경사로', '계단', '엘리베이터', '자동문'], answer: '계단' },
    { question: '장애인 화장실은 몇층에 있는것이 가장 좋을까요?', options: ['1층', '2층', '3층', '4층'], answer: '1층' },
    { question: '장애인 화장실에 필요하지 않은것은?', options: ['세면대', '변기', '안전손잡이', '청소도구함'], answer: '청소도구함' },
    { question: '다음중 가장 이동약자는?', options: ['어린이', '노약자', '임산부', '휠체어이용자'], answer: '휠체어이용자' },
];

const DISCUSSION_QUESTIONS = [
    {
        question: "우리가 왜 이 활동을 했나요?",
        reason: "우리 학교의 시설물들이 휠체어이용자에게 불편한지 확인해봤어요"
    },
    {
        question: "우리 학교 장애인용 화장실을 조사해보니 어떤 점이 고쳐져야 하나요?",
        reason: "화장실 앞으로 여는문이라 휠체어를 타고 혼자 열기 어려웠어요"
    },
    {
        question: "시설을 직접 사용해보니 어떤 부분이 불편했나요??",
        reason: "청소도구함이 있어서 불편했어요."
    },
    {
        question: "휠체어 이용자를 위한 화장실을 만들기 위해 우리가 할 수 있는 일은 무엇일까요?",
        reason: "창고처럼 쓰지 않도록 우리도 신경써야해요!"
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
        responses: discussionResponses.filter(r => r.questionIndex === currentDiscussionIndex),
        allResponses: discussionResponses,
        allQuestions: DISCUSSION_QUESTIONS
    });
};

// Track the teacher's socket ID
let teacherSocketId = null;

const resetGame = () => {
    console.log('Resetting game/discussion state.');
    gameStatus = 'waiting';
    discussionStatus = 'waiting';
    currentDiscussionIndex = 0;
    discussionResponses.length = 0; // Clear discussion responses
    // Notify everyone about the reset
    broadcastDiscussionState(); // Resets discussion to waiting
    // For quiz, there isn't a dedicated 'reset' event in the current frontend, 
    // but this ensures new connections see 'waiting'.
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
        if ((studentScores[socket.id] || 0) < QUIZ_DATA.length) {
            const q = QUIZ_DATA[studentScores[socket.id] || 0];
            socket.emit('question', {
                question: q.question,
                options: q.options
            });
        } else {
            socket.emit('finished');
        }
    }

    // Send current discussion status
    if (discussionStatus === 'discussing') {
        socket.emit('discussionState', {
            status: discussionStatus,
            currentQuestionIndex: currentDiscussionIndex,
            currentQuestion: DISCUSSION_QUESTIONS[currentDiscussionIndex],
            responses: discussionResponses.filter(r => r.questionIndex === currentDiscussionIndex),
            allResponses: discussionResponses,
            allQuestions: DISCUSSION_QUESTIONS
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
            if ((studentScores[socket.id] || 0) < QUIZ_DATA.length) {
                const q = QUIZ_DATA[studentScores[socket.id] || 0];
                socket.emit('question', {
                    question: q.question,
                    options: q.options
                });
            } else {
                socket.emit('finished');
            }
        }

        // If discussion is active, send state
        if (discussionStatus === 'discussing') {
            socket.emit('discussionState', {
                status: discussionStatus,
                currentQuestionIndex: currentDiscussionIndex,
                currentQuestion: DISCUSSION_QUESTIONS[currentDiscussionIndex],
                responses: discussionResponses.filter(r => r.questionIndex === currentDiscussionIndex),
                allResponses: discussionResponses,
                allQuestions: DISCUSSION_QUESTIONS
            });
        }
    });

    // --- Quiz Events ---
    socket.on('startQuiz', () => {
        teacherSocketId = socket.id; // Record teacher ID
        console.log(`Teacher started quiz: ${teacherSocketId}`);

        gameStatus = 'playing';
        discussionStatus = 'waiting'; // Reset discussion if quiz starts
        // Reset scores
        for (const id in students) {
            studentScores[id] = 0;
        }
        io.emit('gameStarted');
        broadcastScores();

        // Send first question to everyone (since everyone acts individually now)
        if (QUIZ_DATA.length > 0) {
            const q = QUIZ_DATA[0];
            io.emit('question', {
                question: q.question,
                options: q.options
            });
        }
    });

    socket.on('submitAnswer', ({ answer }) => {
        const currentScore = studentScores[socket.id] || 0;
        if (currentScore >= QUIZ_DATA.length) return; // Already finished

        const currentQuestion = QUIZ_DATA[currentScore];

        if (answer === currentQuestion.answer) {
            // Correct! 
            // 1. Give point to this student (advance progress)
            studentScores[socket.id] = currentScore + 1;
            socket.emit('correct'); // Tell winner they were correct

            // 2. Broadcast new scores so teacher sees progress
            broadcastScores();

            // 3. Send NEXT question to THIS student only
            if (studentScores[socket.id] >= QUIZ_DATA.length) {
                socket.emit('finished');
            } else {
                const nextQ = QUIZ_DATA[studentScores[socket.id]];
                socket.emit('question', {
                    question: nextQ.question,
                    options: nextQ.options
                });
            }
        } else {
            socket.emit('incorrect');
        }
    });

    socket.on('getQuestion', () => {
        // In individual mode, send the question for this specific user
        const currentScore = studentScores[socket.id] || 0;
        if (currentScore < QUIZ_DATA.length) {
            const q = QUIZ_DATA[currentScore];
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
        teacherSocketId = socket.id; // Record teacher ID
        console.log(`Teacher started discussion: ${teacherSocketId}`);

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

        // If the teacher disconnected, reset everything
        if (socket.id === teacherSocketId) {
            console.log('Teacher disconnected. Resetting game.');
            resetGame();
            teacherSocketId = null;
        }

        if (students[socket.id]) {
            delete students[socket.id];
            delete studentScores[socket.id];
            io.emit('studentListUpdate', Object.entries(students).map(([id, nickname]) => ({ id, nickname })));
            broadcastScores();

            // If no students left (or everyone disconnected), reset state to waiting
            if (Object.keys(students).length === 0) {
                // Also reset using generic helper, just in case teacher wasn't set or cleared
                resetGame();
            }
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
