import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import VoiceInput from '@/components/VoiceInput';

interface DiscussionQuestion {
    question: string;
    reason: string;
}

const StudentDiscussionPage = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [nickname, setNickname] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [discussionStatus, setDiscussionStatus] = useState<'waiting' | 'discussing'>('waiting');
    const [currentQuestion, setCurrentQuestion] = useState<DiscussionQuestion | null>(null);
    const [myResponse, setMyResponse] = useState<string | null>(null);

    useEffect(() => {
        const newSocket = io('/', {
            path: '/socket.io',
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('discussionState', (state: any) => {
            setDiscussionStatus(state.status);
            setCurrentQuestion(state.currentQuestion);
            // Reset my response when question changes
            setMyResponse(null);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleJoin = () => {
        if (socket && nickname.trim()) {
            socket.emit('join', nickname);
            setIsJoined(true);
        }
    };

    const handleSubmitOpinion = (text: string) => {
        if (socket) {
            socket.emit('submitDiscussion', { text });
            setMyResponse(text);
        }
    };

    if (!isJoined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">토론 참여하기</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="이름을 입력하세요"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="text-lg h-12 text-center"
                        />
                        <Button
                            className="w-full h-12 text-lg"
                            onClick={handleJoin}
                            disabled={!nickname.trim()}
                        >
                            입장하기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (discussionStatus === 'waiting') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md text-center p-8">
                    <h2 className="text-2xl font-bold mb-4">대기 중...</h2>
                    <p className="text-muted-foreground">선생님이 토론을 시작할 때까지 기다려주세요.</p>
                    <div className="mt-8 animate-pulse text-4xl">⏳</div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center">
            <Card className="w-full max-w-lg mb-8 border-primary/20 shadow-md">
                <CardContent className="p-6 text-center space-y-4">
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                        오늘의 토론 주제
                    </span>
                    <h2 className="text-2xl font-bold leading-snug">
                        {currentQuestion?.question}
                    </h2>
                </CardContent>
            </Card>

            <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center space-y-8">
                {myResponse ? (
                    <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-100 text-green-800 p-6 rounded-2xl">
                            <p className="font-bold text-lg mb-2">의견이 제출되었습니다!</p>
                            <p>"{myResponse}"</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            다른 친구들의 의견을 화면에서 확인해보세요.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-center text-lg font-medium text-slate-600">
                            마이크 버튼을 누르고<br />여러분의 생각을 말해주세요.
                        </p>
                        <VoiceInput onSubmit={handleSubmitOpinion} />
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentDiscussionPage;
