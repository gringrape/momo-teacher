import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Users, MessageCircle, Heart, PenTool, CheckCircle, Accessibility, Wrench, Sparkles, Check, X } from 'lucide-react';

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

interface DiscussionReportProps {
    questions: DiscussionQuestion[];
    responses: DiscussionResponse[];
    students: Student[];
    onBack: () => void;
}

const DiscussionReport = ({ questions, responses, students, onBack }: DiscussionReportProps) => {
    const [feelingConfig, setFeelingConfig] = useState("직접 휠체어를 타고 화장실을 이용해보니, 생각보다 정말 불편했어요. 문도 무겁고, 공간도 좁고, 손잡이도 멀었어요.\n우리는 금방 일어나서 걸을 수 있지만, 매일 휠체어를 타야 하는 친구들은 매일매일 이런 불편함을 겪는다고 생각하니 마음이 아팠어요.");
    const [principalMessage, setPrincipalMessage] = useState("안녕하세요, 교장선생님! 🙇‍♂️\n\n저희는 6학년 학생들인데요. 선생님과 함께 우리 학교의 장애인 편의시설을 직접 조사해보았어요.\n\n휠체어를 타고 화장실을 이용해보니까, 평소에는 몰랐던 불편한 점들이 정말 많았어요. 휠체어 있는 친구들과 선생님들이 매일 이런 어려움을 겪고 있다고 생각하니 마음이 무거워요.\n\n✨ 저희가 발견한 문제점들을 이 건의서에 담았어요. 교장선생님께서 읽어주시고, 우리 학교가 모든 사람에게 편한 곳이 될 수 있도록 도와주세요!\n\n저희의 작은 목소리에 귀 기울여 주셔서 감사합니다. 🙏");

    const today = new Date();
    const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    const [participationCount, setParticipationCount] = useState(students.length.toString());
    const [customStudents, setCustomStudents] = useState<Student[]>([]);
    const [teacherName, setTeacherName] = useState("");

    // Inline student add state
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [newStudentName, setNewStudentName] = useState("");

    const confirmAddStudent = () => {
        if (newStudentName.trim()) {
            setCustomStudents(prev => [...prev, { id: `custom-${Date.now()}`, nickname: newStudentName.trim() }]);
            setNewStudentName("");
            setIsAddingStudent(false);
        }
    };

    const cancelAddStudent = () => {
        setNewStudentName("");
        setIsAddingStudent(false);
    };

    // Group responses by question
    const responsesByQuestion = questions.map((_, index) =>
        responses.filter(r => r.questionIndex === index)
    );

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans print:p-0 print:bg-white">
            <style>{`
                @media print {
                    @page {
                        margin: 15mm;
                        size: auto;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Ensure icons and backgrounds print correctly */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* Top Navigation */}
            <div className="max-w-5xl mx-auto flex justify-between items-center mb-8 print:hidden">
                <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    돌아가기
                </Button>
                <Button onClick={() => window.print()} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    인쇄하기
                </Button>
            </div>

            {/* Report Container */}
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden print:shadow-none print:overflow-visible print:max-w-none print:w-full print:rounded-none">

                {/* Header */}
                <header className="text-center pt-16 pb-8 px-8 bg-white">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">우리학교 접근성 개선 건의서</h1>
                    <p className="text-slate-500 font-medium text-lg">서울숭인초등학교 학생들의 휠체어 접근성 조사 및 개선 제안</p>
                    <p className="text-slate-400 text-sm mt-2">조사 일자: {formattedDate}</p>
                </header>

                <div className="p-8 space-y-8">
                    {/* Section 1: Why we did this (Now dynamic) */}
                    <section className="bg-sky-50 rounded-2xl p-8 border border-sky-100 print:break-inside-avoid">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-sky-200 p-2 rounded-full">
                                <Users className="w-6 h-6 text-sky-700" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">우리가 왜 이 활동을 했나요?</h2>
                        </div>

                        {/* Dynamic Responses for Q1 (Index 0) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {responsesByQuestion[0] && responsesByQuestion[0].length > 0 ? (
                                responsesByQuestion[0].map((resp, idx) => (
                                    <div key={idx}
                                        className={`relative p-6 rounded-sm shadow-md font-medium text-slate-700 aspect-[1.8/1] min-h-[160px] flex flex-col justify-between transition-transform hover:scale-105 hover:z-10 print:break-inside-avoid ${['bg-[#FFF7B1]', 'bg-[#FFD1DA]', 'bg-[#D7F1FD]', 'bg-[#E2F0CB]'][idx % 4]
                                            }`}
                                        style={{ transform: `rotate(${(idx * 13 % 10) - 5}deg)` }}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/30 backdrop-blur-[1px] shadow-sm rotate-[2deg]"></div>
                                        <p className="mb-4 text-base leading-relaxed overflow-y-auto font-handwriting">"{resp.text}"</p>
                                        <p className="text-right text-sm font-bold opacity-80">- {resp.nickname}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center text-slate-400 text-sm py-4">
                                    <p>아직 작성된 내용이 없어요.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-sky-100 p-4 rounded-xl flex items-center gap-3">
                            <span className="text-xl">👥</span>
                            <div className="flex items-center gap-1 font-bold text-sky-900">
                                <Input
                                    className="w-16 text-center bg-white border-sky-200 h-8 font-bold text-sky-900 focus-visible:ring-sky-300"
                                    value={participationCount}
                                    onChange={(e) => setParticipationCount(e.target.value)}
                                />
                                <span>명의 친구들이 함께 조사했고, 선생님과 토론하면서 우리가 느낀 점을 이야기했어요!</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Discussion Content */}
                    <section>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-1 rounded-full text-slate-600 text-sm font-medium mb-2">
                                <MessageCircle className="w-4 h-4" />
                                우리의 토론 내용
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">선생님과 학생 토론에서 우리가 발견한 문제점들이에요!</h2>
                        </div>

                        <div className="space-y-6">
                            {questions.slice(1).map((q, slicedIdx) => {
                                const originalIdx = slicedIdx + 1;
                                const icons = [Accessibility, Wrench, Heart];
                                const IconComponent = icons[slicedIdx % icons.length];

                                return (
                                    <div key={originalIdx} className="bg-slate-50 rounded-xl p-6 border border-slate-200 print:break-inside-avoid">
                                        <div className="flex items-center gap-4 mb-6 bg-cyan-50 p-5 rounded-2xl border-2 border-dashed border-cyan-300">
                                            <div className="bg-cyan-100 p-3 rounded-full flex-shrink-0">
                                                <IconComponent className="w-6 h-6 text-cyan-600" />
                                            </div>
                                            <div>
                                                <span className="text-cyan-600 font-bold text-sm block mb-1">선생님 질문</span>
                                                <h3 className="text-xl font-bold text-slate-800 leading-snug">{q.question}</h3>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-12">
                                            {responsesByQuestion[originalIdx] && responsesByQuestion[originalIdx].length > 0 ? (
                                                responsesByQuestion[originalIdx].map((resp, rIdx) => (
                                                    <div key={rIdx}
                                                        className={`relative p-6 rounded-sm shadow-md font-medium text-slate-700 aspect-[1.8/1] min-h-[160px] flex flex-col justify-between transition-transform hover:scale-105 hover:z-10 print:break-inside-avoid ${['bg-[#FFF7B1]', 'bg-[#FFD1DA]', 'bg-[#D7F1FD]', 'bg-[#E2F0CB]'][rIdx % 4]
                                                            }`}
                                                        style={{ transform: `rotate(${(rIdx * 17 % 10) - 5}deg)` }}
                                                    >
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/30 backdrop-blur-[1px] shadow-sm rotate-[2deg]"></div>
                                                        <p className="mb-4 text-base leading-relaxed overflow-y-auto font-handwriting">"{resp.text}"</p>
                                                        <p className="text-right text-sm font-bold opacity-80">- {resp.nickname}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-slate-400 text-sm italic py-2">아직 답변이 없어요.</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Section 3: What we felt (Editable) */}
                    <section className="bg-[#fff0f5] rounded-3xl p-8 border-2 border-pink-200 shadow-sm print:break-inside-avoid">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-pink-400 p-2.5 rounded-full shadow-sm">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">우리가 느낀 점</h2>
                        </div>

                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-pink-100 mb-6 relative">
                            <div className="absolute top-8 left-8 text-2xl">💭</div>
                            <Textarea
                                className="w-full min-h-[140px] p-6 pl-16 text-base leading-relaxed text-slate-700 resize-none border-none focus-visible:ring-0 bg-transparent"
                                value={feelingConfig}
                                onChange={(e) => setFeelingConfig(e.target.value)}
                                placeholder="활동을 하며 느낀 점을 자유롭게 적어주세요..."
                            />
                        </div>

                        <div className="flex items-center gap-3 bg-pink-100/80 px-6 py-4 rounded-xl text-slate-700">
                            <Heart className="w-6 h-6 text-pink-500 fill-pink-500 flex-shrink-0" />
                            <p className="font-semibold text-sm md:text-base leading-snug">모든 친구들이 편하게 학교생활을 할 수 있도록, 우리가 발견한 문제점들이 꼭 고쳐졌으면 좋겠어요! 🙏</p>
                        </div>
                    </section>

                    {/* Section 4: Message to Principal (Editable) */}
                    <section className="bg-amber-50 rounded-2xl p-8 border border-amber-100 print:break-inside-avoid">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-amber-200 p-2 rounded-full">
                                <PenTool className="w-6 h-6 text-amber-800" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">교장선생님께 드리는 말씀</h2>
                                <p className="text-slate-500 text-xs">우리의 작은 목소리가 큰 변화가 되길 바래요!</p>
                            </div>
                        </div>
                        <div className="mt-6 bg-white p-1 rounded-xl shadow-sm border border-amber-200">
                            <Textarea
                                className="w-full min-h-[250px] p-8 text-base leading-relaxed text-slate-700 resize-none border-none focus-visible:ring-0 font-medium bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]"
                                style={{ lineHeight: '2em' }}
                                value={principalMessage}
                                onChange={(e) => setPrincipalMessage(e.target.value)}
                            />
                        </div>
                    </section>

                    {/* Section 5: Student Signatures */}
                    <section className="bg-white rounded-2xl p-8 border-[3px] border-cyan-100 print:break-inside-avoid">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-cyan-100 p-2 rounded-full">
                                <Users className="w-6 h-6 text-cyan-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">참여 학생 서명</h2>
                                <p className="text-slate-500 text-sm">이 건의서를 함께 만든 친구들이에요!</p>
                            </div>
                        </div>

                        <div className="bg-cyan-50/50 p-6 rounded-xl text-center mb-6 border border-cyan-100">
                            <p className="text-slate-700 font-bold">"우리는 모든 친구들이 <span className="text-cyan-600">불편함 없이</span> 학교생활을 할 수 있기를 바라며, 이 건의서를 교장선생님께 정중히 제출합니다."</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[...students, ...customStudents].map((s) => (
                                <div key={s.id} className="bg-white border-2 border-cyan-50 rounded-lg p-4 text-center hover:border-cyan-200 transition-colors group relative shadow-sm">
                                    <p className="font-bold text-slate-800 text-lg mb-1">{s.nickname}</p>
                                    <span className="text-slate-400 font-serif text-sm">(서명)</span>
                                    {s.id.startsWith('custom-') && (
                                        <button
                                            onClick={() => setCustomStudents(prev => prev.filter(st => st.id !== s.id))}
                                            className="absolute top-1 right-1 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isAddingStudent ? (
                                <div className="bg-white border-2 border-cyan-200 rounded-lg p-2 flex flex-col items-center justify-center gap-2 min-h-[88px]">
                                    <Input
                                        autoFocus
                                        value={newStudentName}
                                        onChange={(e) => setNewStudentName(e.target.value)}
                                        className="w-24 h-8 text-sm px-2 text-center border-slate-200 focus-visible:ring-cyan-200"
                                        placeholder="이름"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') confirmAddStudent();
                                            if (e.key === 'Escape') cancelAddStudent();
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={confirmAddStudent} className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={cancelAddStudent} className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingStudent(true)}
                                    className="bg-cyan-50/50 border-2 border-dashed border-cyan-200 rounded-lg p-4 flex flex-col items-center justify-center text-cyan-400 hover:border-cyan-400 hover:text-cyan-600 transition-all min-h-[88px]"
                                >
                                    <span className="text-2xl font-light">+</span>
                                    <span className="text-xs mt-1">추가하기</span>
                                </button>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center gap-16 text-center text-sm text-slate-500 font-medium">
                            <div>
                                <p className="mb-1 text-slate-400 text-xs">학교</p>
                                <p className="text-slate-800 text-base font-bold">서울숭인초등학교</p>
                            </div>
                            <div>
                                <p className="mb-1 text-slate-400 text-xs">참여 학생</p>
                                <p className="text-slate-800 text-base font-bold">{students.length + customStudents.length}명</p>
                            </div>
                            <div>
                                <p className="mb-1 text-slate-400 text-xs">작성일</p>
                                <p className="text-slate-800 text-base font-bold">{formattedDate}</p>
                            </div>
                        </div>
                    </section>

                    {/* Footer: Teacher Sign */}
                    <section className="bg-[#f0f9ff] rounded-2xl p-8 border border-cyan-100 mt-12 print:break-inside-avoid">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white p-2 rounded-full border border-cyan-100">
                                <Users className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-slate-800 text-lg">지도 교사 확인</h3>
                                <p className="text-slate-500 text-xs">학생들의 활동을 지도하고 확인합니다</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-cyan-100 text-slate-600 text-sm leading-relaxed mb-8 shadow-sm">
                            위 학생들이 직접 휠체어를 타고 학교 시설을 체험하며 조사한 내용을 바탕으로 작성된 건의서입니다. 학생들의 진지한 참여와 제안이 실제 개선으로 이어지기를 희망하며 이를 확인합니다.
                        </div>

                        <div className="flex justify-center">
                            <div className="bg-white px-10 py-8 rounded-xl border-2 border-dashed border-slate-200 text-center min-w-[300px]">
                                <p className="text-base text-slate-500 font-bold mb-6">담당 교사</p>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center justify-center gap-3 mb-10">
                                        <Input
                                            className="w-25 text-center text-2xl font-bold border border-slate-200 rounded-full py-4 h-auto focus-visible:ring-2 focus-visible:ring-cyan-100 placeholder:text-slate-500 placeholder:font-medium text-slate-700 shadow-sm"
                                            value={teacherName}
                                            onChange={(e) => setTeacherName(e.target.value)}
                                            placeholder="이름"
                                        />
                                        <span className="text-1.5xl font-bold text-slate-700 shrink-0">선생님</span>
                                    </div>
                                    <p className="text-slate-300 text-sm font-serif select-none">(서명)</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default DiscussionReport;
