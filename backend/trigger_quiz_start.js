const io = require('../frontend/node_modules/socket.io-client');

const socketUrl = 'http://localhost:3000';
const teacher = io(socketUrl);

console.log('Teacher Trigger: Connecting...');

teacher.on('connect', () => {
    console.log('Teacher connected:', teacher.id);
    console.log('Starting quiz...');
    teacher.emit('startQuiz');
    console.log('Quiz started signal sent.');
});

// Keep process alive for 5 minutes to keep teacher connection maybe? 
// Actually connection persistence isn't strictly required for the quiz state to remain 'playing' in this simple backend, 
// but good to keep it open.
setInterval(() => { }, 60000);
