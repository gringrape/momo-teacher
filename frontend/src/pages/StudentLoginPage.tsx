import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuizPlayer from '@/components/QuizPlayer';

const StudentLoginPage = () => {
    const [nickname, setNickname] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    const handleJoin = () => {
        if (!nickname.trim()) return;

        const newSocket = io('/', {
            path: '/socket.io',
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            newSocket.emit('join', nickname);
            setIsJoined(true);
        });

        newSocket.on('gameStarted', () => {
            setGameStarted(true);
        });

        setSocket(newSocket);
    };

    if (gameStarted && socket) {
        return <QuizPlayer socket={socket} />;
    }

    if (isJoined) {
        return (
            <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">대기 중</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-xl font-semibold">{nickname}님, 환영합니다!</p>
                        <p className="text-muted-foreground">선생님이 퀴즈를 시작할 때까지 기다려주세요.</p>
                        <div className="animate-pulse">
                            <div className="h-2 bg-primary rounded-full w-1/2 mx-auto"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">학생 입장</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="nickname" className="text-sm font-medium">
                            닉네임
                        </label>
                        <Input
                            id="nickname"
                            placeholder="닉네임을 입력하세요"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                    </div>
                    <Button className="w-full" onClick={handleJoin} disabled={!nickname.trim()}>
                        입장하기
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentLoginPage;
