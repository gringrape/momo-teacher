import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { createSocketClient } from '@/api/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RacingTrack from '@/components/RacingTrack';
import QRCode from 'react-qr-code';

interface Student {
    id: string;
    nickname: string;
}

const TeacherQuizPage = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [gameStatus, setGameStatus] = useState<'waiting' | 'playing'>('waiting');
    const [progress, setProgress] = useState<Record<string, number>>({});

    useEffect(() => {
        // Connect to the backend server (same origin)
        const newSocket = createSocketClient();

        const onConnect = () => {
            console.log('Connected to socket server');
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log('Disconnected from socket server');
            setIsConnected(false);
        };

        const onStudentListUpdate = (studentList: Student[]) => {
            setStudents(studentList);
        };

        const onGameStarted = () => {
            setGameStatus('playing');
        };

        const onProgressUpdate = (newProgress: Record<string, number>) => {
            setProgress(newProgress);
        };

        newSocket.on('connect', onConnect);
        newSocket.on('disconnect', onDisconnect);
        newSocket.on('studentListUpdate', onStudentListUpdate);
        newSocket.on('gameStarted', onGameStarted);
        newSocket.on('progressUpdate', onProgressUpdate);

        setSocket(newSocket);

        // Check initial connection state
        if (newSocket.connected) {
            onConnect();
            newSocket.emit('requestState');
        }

        return () => {
            newSocket.off('connect', onConnect);
            newSocket.off('disconnect', onDisconnect);
            newSocket.off('studentListUpdate', onStudentListUpdate);
            newSocket.off('gameStarted', onGameStarted);
            newSocket.off('progressUpdate', onProgressUpdate);
        };
    }, []);

    const handleStartQuiz = () => {
        if (socket) {
            socket.emit('startQuiz');
            console.log('Quiz started!');
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">선생님 퀴즈 관리</h1>

            <div className="grid gap-6">

                {gameStatus === 'waiting' ? (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>접속한 학생 ({students.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {students.length === 0 ? (
                                    <p className="text-muted-foreground">아직 접속한 학생이 없습니다.</p>
                                ) : (
                                    <ul className="list-disc pl-5">
                                        {students.map((student) => (
                                            <li key={student.id}>{student.nickname}</li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>학생 입장 QR 코드</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <QRCode value={`${window.location.origin}/student/login`} size={200} />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {`${window.location.origin}/student/login`}
                                </p>
                            </CardContent>
                        </Card>

                        <Button size="lg" onClick={handleStartQuiz} className="w-full md:w-auto">
                            퀴즈 시작하기
                        </Button>
                    </>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>실시간 레이싱</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RacingTrack students={students} progress={progress} totalQuestions={10} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TeacherQuizPage;
