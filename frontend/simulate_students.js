import { io } from "socket.io-client";

const socket1 = io("http://localhost:3000");
const socket2 = io("http://localhost:3000");

console.log("Connecting students...");

// Student 1
socket1.on("connect", () => {
    console.log("Student 1 connected");
    socket1.emit("join", "Student1");
});

socket1.on("gameStarted", () => {
    console.log("Student 1: Game Started");
});

socket1.on("question", (data) => {
    console.log("Student 1 received question:", data.question);
    if (data.question.includes("한국")) {
        console.log("Student 1 answering: 서울 (Correct)");
        socket1.emit("submitAnswer", { answer: "서울" });
    } else if (data.question.includes("미국")) {
        console.log("Student 1 received Q2:", data.question);
    }
});

socket1.on("correct", () => {
    console.log("Student 1: Correct! (Score +1)");
});

// Student 2
socket2.on("connect", () => {
    console.log("Student 2 connected");
    socket2.emit("join", "Student2");
});

socket2.on("gameStarted", () => {
    console.log("Student 2: Game Started");
});

socket2.on("question", (data) => {
    console.log("Student 2 received question:", data.question);
    if (data.question.includes("미국")) {
        console.log("VERIFICATION SUCCESS: Student 2 received Q2 automatically!");
    }
});

// Keep alive
setInterval(() => { }, 1000);
