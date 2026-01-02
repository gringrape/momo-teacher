import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { createSocketClient } from '@/api/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QRCode from 'react-qr-code';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DiscussionReport from '@/components/DiscussionReport';

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
    const [allResponses, setAllResponses] = useState<DiscussionResponse[]>([]);
    const [allQuestions, setAllQuestions] = useState<DiscussionQuestion[]>([]);
    const [layoutMap, setLayoutMap] = useState<Record<string, { x: number; y: number; rotate: number; color: string }>>({});

    // Teacher Input State
    const [isTeacherInputOpen, setIsTeacherInputOpen] = useState(false);
    const [teacherNickname, setTeacherNickname] = useState('선생님');
    const [teacherOpinion, setTeacherOpinion] = useState('');
    const [showReport, setShowReport] = useState(false);

    // Drag and Drop State
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const dragStartPos = useRef<{ x: number, y: number, itemX: number, itemY: number } | null>(null);

    useEffect(() => {
        // Calculate layouts for new responses
        setLayoutMap(prev => {
            const next = { ...prev };
            let changed = false;

            responses.forEach((r, index) => {
                const key = `${r.nickname}-${r.timestamp}`;
                if (!next[key]) {
                    // Grid Layout Logic
                    // 3 columns: 0, 1, 2
                    const col = index % 3;
                    const row = Math.floor(index / 3);

                    // Base percentages + jitter
                    // X: 5%, 38%, 71% (spread across width)
                    // Y: Starts at 5%, increments by ~32%
                    next[key] = {
                        x: (col * 33) + 2 + Math.random() * 3,
                        y: (row * 32) + 5 + Math.random() * 3, // Adjusted spacing for vertical flow
                        rotate: Math.random() * 6 - 3, // Slight rotation -3 to +3
                        color: ['bg-[#FFF7B1] text-slate-800', 'bg-[#FFD1DA] text-slate-800', 'bg-[#D7F1FD] text-slate-800', 'bg-[#E2F0CB] text-slate-800'][index % 4]
                    };
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [responses]);

    useEffect(() => {
        const newSocket = createSocketClient();
        // ... (socket effect)
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
            if (state.allResponses) {
                setAllResponses(state.allResponses);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Drag Handlers
    // ... (omitted for brevity, keep existing handlers)
    const handlePointerDown = (e: React.PointerEvent, key: string, currentLayout: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (!containerRef.current) return;

        setDraggingId(key);
        dragStartPos.current = {
            x: e.clientX,
            y: e.clientY,
            itemX: currentLayout.x,
            itemY: currentLayout.y
        };

        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingId || !dragStartPos.current || !containerRef.current) return;

        e.preventDefault();

        const containerRect = containerRef.current.getBoundingClientRect();
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;

        // Convert delta pixels to percentage of container
        const deltaXPercent = (deltaX / containerRect.width) * 100;
        const deltaYPercent = (deltaY / containerRect.height) * 100;

        const newX = dragStartPos.current.itemX + deltaXPercent;
        const newY = dragStartPos.current.itemY + deltaYPercent;

        setLayoutMap(prev => ({
            ...prev,
            [draggingId]: {
                ...prev[draggingId],
                x: newX,
                y: newY
            }
        }));
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (draggingId) {
            e.preventDefault();
            setDraggingId(null);
            dragStartPos.current = null;
        }
    };

    const handleStartDiscussion = () => {
        if (socket) {
            socket.emit('startDiscussion');
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < 3 && socket) {
            socket.emit('nextDiscussionQuestion');
        } else {
            // Show Report
            setShowReport(true);
        }
    };

    const handleTeacherSubmit = () => {
        if (socket && teacherOpinion.trim()) {
            socket.emit('submitDiscussion', {
                text: teacherOpinion,
                nickname: teacherNickname
            });
            setTeacherOpinion('');
            setIsTeacherInputOpen(false);
        }
    };

    if (showReport) {
        return (
            <DiscussionReport
                questions={allQuestions.length > 0 ? allQuestions : (currentQuestion ? [currentQuestion] : [])}
                responses={allResponses}
                students={students}
                onBack={() => setShowReport(false)}
            />
        );
    }

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
                <div className="animate-in fade-in duration-700 flex flex-col items-center justify-center min-h-[50vh]">
                    <h2 className="text-4xl font-bold mb-4">토론이 종료되었습니다</h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        모든 학생들의 의견이 수집되었습니다.
                    </p>
                    <div className="text-center">
                        <Button onClick={() => window.location.reload()} variant="outline" size="lg">
                            새로운 토론 시작하기
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
                    <Card className="border-[12px] border-[#8B4513] bg-[#2F4F4F] shadow-2xl rounded-sm relative overflow-hidden">
                        {/* Chalk dust effect */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-chalk.png')] opacity-30 pointer-events-none mix-blend-overlay"></div>

                        <CardContent className="p-12 text-center space-y-8 relative z-10">
                            <div className="inline-block bg-white/10 text-white border border-white/20 px-6 py-2 rounded-full font-bold mb-4 backdrop-blur-sm">
                                질문 {currentQuestionIndex + 1}
                            </div>
                            <h2 className="text-4xl font-bold leading-tight text-white font-serif tracking-wide drop-shadow-md">
                                {currentQuestion?.question}
                            </h2>
                            <p className="text-2xl text-slate-200 font-medium font-handwriting tracking-wide">
                                {currentQuestion?.reason}
                            </p>
                            <div className="pt-8">
                                <Button
                                    onClick={handleNextQuestion}
                                    className="bg-white text-[#2F4F4F] hover:bg-slate-100 hover:scale-105 transition-all font-bold text-lg h-14 px-8 rounded-full shadow-lg border-none"
                                >
                                    {currentQuestionIndex < 3 ? '다음 질문으로 넘어가기' : '개선건의서 만들기'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Teacher Input Dialog Trigger */}
                    <div className="flex justify-end">
                        <Dialog open={isTeacherInputOpen} onOpenChange={setIsTeacherInputOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="shadow-sm">
                                    ✏️ 선생님 의견 작성하기
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>선생님 의견 추가</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nickname">작성자 이름</Label>
                                        <Input
                                            id="nickname"
                                            value={teacherNickname}
                                            onChange={(e) => setTeacherNickname(e.target.value)}
                                            placeholder="이름을 입력하세요"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="opinion">의견 내용</Label>
                                        <Textarea
                                            id="opinion"
                                            value={teacherOpinion}
                                            onChange={(e) => setTeacherOpinion(e.target.value)}
                                            placeholder="학생들에게 보여줄 의견을 작성하세요"
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" onClick={handleTeacherSubmit}>등록하기</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div
                        ref={containerRef}
                        className="relative w-full h-[600px] bg-amber-50 rounded-xl border-4 border-amber-200 overflow-y-auto overflow-x-hidden shadow-inner touch-none"
                    >
                        {/* Message when empty */}
                        {responses.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-amber-300 opacity-50">
                                <p className="text-4xl font-bold rotate-[-5deg] select-none">학생들의 답변을 기다리고 있어요...</p>
                            </div>
                        )}

                        {responses.map((response, index) => {
                            const key = `${response.nickname}-${response.timestamp}`;
                            // Use pre-calculated layout or fallback
                            const layout = layoutMap[key] || {
                                x: 50,
                                y: 50,
                                rotate: 0,
                                color: 'bg-[#FFF7B1] text-slate-800'
                            };

                            return (
                                <div
                                    key={index}
                                    className={`absolute w-72 animate-in fade-in zoom-in duration-500 cursor-move ${draggingId === key ? 'z-[999] scale-105' : ''}`}
                                    style={{
                                        left: `${layout.x}%`,
                                        top: `${layout.y}%`,
                                        zIndex: draggingId === key ? 999 : index + 10,
                                        transform: `rotate(${layout.rotate}deg)`,
                                        touchAction: 'none'
                                    }}
                                    onPointerDown={(e) => handlePointerDown(e, key, layout)}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerCancel={handlePointerUp}
                                >
                                    <div className={`relative ${layout.color} p-6 pt-8 rounded-sm shadow-md hover:shadow-2xl hover:scale-105 hover:z-[100] transition-all duration-300 min-h-[160px] flex flex-col justify-between select-none`}>
                                        {/* Tape effect */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/40 backdrop-blur-[1px] shadow-sm rotate-[2deg]"></div>

                                        <p className="text-lg font-medium mb-4 leading-relaxed relative z-10 font-handwriting select-none">
                                            "{response.text}"
                                        </p>
                                        <div className="text-right font-bold opacity-80 z-10 text-sm select-none">
                                            - {response.nickname}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDiscussionPage;
