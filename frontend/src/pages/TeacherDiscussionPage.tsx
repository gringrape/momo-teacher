import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QRCode from 'react-qr-code';
import { MessageCircle } from 'lucide-react';
import MindMap from '@/components/MindMap';

interface Student {
    id: string;
    nickname: string;
}

interface DiscussionResponse {
    nickname: string;
    text: string;
    questionIndex: number;
    timestamp: number;
}

interface DiscussionQuestion {
    question: string;
    reason: string;
}

const TeacherDiscussionPage = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [discussionStatus, setDiscussionStatus] = useState<'waiting' | 'discussing' | 'finished'>('waiting');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<DiscussionQuestion | null>(null);
    const [responses, setResponses] = useState<DiscussionResponse[]>([]);
    const [allQuestions, setAllQuestions] = useState<DiscussionQuestion[]>([]);

    useEffect(() => {
        const newSocket = io('/', {
            path: '/socket.io',
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('studentListUpdate', (studentList: Student[]) => {
            setStudents(studentList);
        });

        newSocket.on('discussionState', (state: any) => {
            setDiscussionStatus(state.status);
            setCurrentQuestionIndex(state.currentQuestionIndex);
            setCurrentQuestion(state.currentQuestion);
            setResponses(state.responses);
            if (state.allQuestions) {
                setAllQuestions(state.allQuestions);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleStartDiscussion = () => {
        if (socket) {
            socket.emit('startDiscussion');
        }
    };

    const handleNextQuestion = () => {
        if (socket) {
            socket.emit('nextDiscussionQuestion');
        }
    };

    return (
        <div className="container mx-auto p-8 min-h-screen bg-slate-50">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">토론 관리</h1>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-muted-foreground">{isConnected ? '연결됨' : '연결 끊김'}</span>
                    <span className="text-sm text-muted-foreground ml-2">접속 학생: {students.length}명</span>
                </div>
            </div>

            {discussionStatus === 'finished' ? (
                <div className="animate-in fade-in duration-700">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            <MindMap questions={allQuestions} responses={responses} />
                        </CardContent>
                    </Card>
                    <div className="mt-8 text-center">
                        <Button onClick={() => window.location.reload()} variant="outline" size="lg">
                            토론 다시 시작하기
                        </Button>
                    </div>
                </div>
            ) : discussionStatus === 'waiting' ? (
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>학생 입장 QR 코드</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-6 py-8">
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <QRCode value={`${window.location.origin}/student/discussion`} size={250} />
                            </div>
                            <p className="text-lg font-medium text-center">
                                {`${window.location.origin}/student/discussion`}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>접속한 학생</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {students.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">아직 접속한 학생이 없습니다.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {students.map((student) => (
                                        <div key={student.id} className="bg-secondary px-4 py-2 rounded-full font-medium">
                                            {student.nickname}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-8">
                                <Button size="lg" onClick={handleStartDiscussion} className="w-full text-lg h-14">
                                    토론 시작하기
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <Card className="border-2 border-primary/20 shadow-lg">
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full font-bold mb-2">
                                질문 {currentQuestionIndex + 1}
                            </div>
                            <h2 className="text-3xl font-bold leading-tight">
                                {currentQuestion?.question}
                            </h2>
                            <p className="text-xl text-muted-foreground font-medium">
                                {currentQuestion?.reason}
                            </p>
                            <div className="pt-4">
                                <Button onClick={handleNextQuestion} variant="outline" size="lg">
                                    {currentQuestionIndex < 3 ? '다음 질문으로 넘어가기' : '개선건의서 만들기'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
                        {responses.map((response, index) => (
                            <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative bg-white p-6 rounded-2xl rounded-tl-none shadow-md border border-slate-100">
                                    <MessageCircle className="absolute top-0 left-0 -mt-2 -ml-2 w-8 h-8 text-primary fill-white" />
                                    <p className="text-lg mb-3 leading-relaxed text-slate-800">
                                        "{response.text}"
                                    </p>
                                    <div className="text-right font-bold text-primary">
                                        - {response.nickname}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDiscussionPage;
