import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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

    // Voice Input State
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

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

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || (window as any).webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'ko-KR';

            recognitionInstance.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                // Update input value directly
                const inputEl = document.getElementById('opinion-input') as HTMLInputElement;
                if (inputEl) {
                    inputEl.value = currentTranscript;
                }
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    const toggleMic = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submit
        if (!recognition) {
            alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

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
                        <p className="text-center text-lg font-medium text-slate-600 mb-8">
                            마이크를 누르고 말하거나<br />텍스트로 입력해주세요.
                        </p>

                        <div className="w-full bg-white p-2 rounded-2xl shadow-lg border border-primary/20">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const input = form.elements.namedItem('opinion') as HTMLInputElement;
                                    if (input.value.trim()) {
                                        handleSubmitOpinion(input.value);
                                        input.value = '';
                                    }
                                }}
                                className="flex gap-2 items-center"
                            >
                                <Input
                                    id="opinion-input"
                                    name="opinion"
                                    placeholder="답변을 입력하세요..."
                                    className="flex-1 border-0 shadow-none focus-visible:ring-0 text-lg h-14 bg-transparent"
                                    autoComplete="off"
                                />

                                <Button
                                    type="button"
                                    variant={isListening ? "destructive" : "secondary"}
                                    size="icon"
                                    className={`rounded-full w-12 h-12 flex-shrink-0 ${isListening ? 'animate-pulse' : ''}`}
                                    onClick={toggleMic}
                                >
                                    {isListening ? (
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                        </span>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                                    )}
                                </Button>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-12 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg"
                                >
                                    전송
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
};

export default StudentDiscussionPage;
