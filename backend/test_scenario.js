const io = require('../frontend/node_modules/socket.io-client');

const socketUrl = 'http://localhost:3000';

const teacher = io(socketUrl);
const student = io(socketUrl);

console.log('Starting test scenario...');

// Helper to wait
const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
    try {
        // 1. Join Student
        await new Promise(resolve => {
            student.on('connect', () => {
                console.log('Student connected:', student.id);
                student.emit('join', 'Student1');
                resolve();
            });
        });

        // 2. Join Teacher (just another connection for now, as there's no auth)
        await new Promise(resolve => {
            teacher.on('connect', () => {
                console.log('Teacher connected:', teacher.id);
                resolve();
            });
        });

        // 3. Start Quiz
        console.log('Teacher starting quiz...');
        teacher.emit('startQuiz');

        // Wait for question
        await new Promise((resolve, reject) => {
            student.once('question', (data) => {
                console.log('Student received first question:', data.question);
                if (data.question) resolve();
                else reject('No question received');
            });
            // Timeout safety
            setTimeout(() => reject('Timeout waiting for question'), 2000);
        });

        // 4. Submit Correct Answer
        // Q1: '장애인 화장실을 이용할때 가장 편한 문은?' Answer: '자동문'
        console.log('Student submitting answer: 자동문');
        student.emit('submitAnswer', { answer: '자동문' });

        // Wait for result
        await new Promise((resolve, reject) => {
            let receivedCorrect = false;
            let receivedNextQuestion = false;

            student.once('correct', () => {
                console.log('Student received: correct');
                receivedCorrect = true;
                if (receivedNextQuestion) resolve();
            });

            student.once('question', (data) => {
                console.log('Student received next question:', data.question);
                receivedNextQuestion = true;
                if (receivedCorrect) resolve();
            });

            setTimeout(() => {
                if (receivedCorrect && receivedNextQuestion) resolve();
                else reject('Timeout waiting for answer result');
            }, 2000);
        });

        console.log('TEST PASSED: Quiz flow works.');
        process.exit(0);

    } catch (error) {
        console.error('TEST FAILED:', error);
        process.exit(1);
    }
})();
