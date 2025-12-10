import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Users, MessageCircle, Heart, PenTool, CheckCircle } from 'lucide-react';

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

    // Group responses by question
    const responsesByQuestion = questions.map((_, index) =>
        responses.filter(r => r.questionIndex === index)
    );

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
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
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden print:shadow-none">

                {/* Header */}
                <header className="text-center pt-16 pb-8 px-8 bg-white">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">우리학교 접근성 개선 건의서</h1>
                    <p className="text-slate-500 font-medium text-lg">서울숭인초등학교 학생들의 휠체어 접근성 조사 및 개선 제안</p>
                    <p className="text-slate-400 text-sm mt-2">조사 일자: {formattedDate}</p>
                </header>

                <div className="p-8 space-y-8">
                    {/* Section 1: Why we did this (Now dynamic) */}
                    <section className="bg-sky-50 rounded-2xl p-8 border border-sky-100">
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
                                        className={`relative p-6 rounded-sm shadow-md font-medium text-slate-700 aspect-[1.8/1] min-h-[160px] flex flex-col justify-between transition-transform hover:scale-105 hover:z-10 ${['bg-[#FFF7B1]', 'bg-[#FFD1DA]', 'bg-[#D7F1FD]', 'bg-[#E2F0CB]'][idx % 4]
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
                                return (
                                    <div key={originalIdx} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-bold text-sm whitespace-nowrap">
                                                질문 {slicedIdx + 1}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">{q.question}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-12">
                                            {responsesByQuestion[originalIdx] && responsesByQuestion[originalIdx].length > 0 ? (
                                                responsesByQuestion[originalIdx].map((resp, rIdx) => (
                                                    <div key={rIdx}
                                                        className={`relative p-6 rounded-sm shadow-md font-medium text-slate-700 aspect-[1.8/1] min-h-[160px] flex flex-col justify-between transition-transform hover:scale-105 hover:z-10 ${['bg-[#FFF7B1]', 'bg-[#FFD1DA]', 'bg-[#D7F1FD]', 'bg-[#E2F0CB]'][rIdx % 4]
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
                    <section className="bg-pink-50 rounded-2xl p-8 border border-pink-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-pink-200 p-2 rounded-full">
                                <Heart className="w-6 h-6 text-pink-700" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">우리가 느낀 점</h2>
                        </div>
                        <div className="bg-white p-1 rounded-xl shadow-sm border border-pink-200">
                            <Textarea
                                className="w-full min-h-[120px] p-6 text-base leading-relaxed text-slate-700 resize-none border-none focus-visible:ring-0"
                                value={feelingConfig}
                                onChange={(e) => setFeelingConfig(e.target.value)}
                                placeholder="활동을 하며 느낀 점을 자유롭게 적어주세요..."
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-pink-600 bg-pink-100 px-4 py-2 rounded-lg text-sm w-fit">
                            <Heart className="w-4 h-4 fill-pink-600" />
                            <p className="font-semibold">모든 친구들이 편하게 학교생활을 할 수 있도록, 우리가 발견한 문제점들이 꼭 고쳐졌으면 좋겠어요! 🙏</p>
                        </div>
                    </section>

                    {/* Section 4: Message to Principal (Editable) */}
                    <section className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
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
                    <section className="bg-white rounded-2xl p-8 border-2 border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-slate-200 p-2 rounded-full">
                                <CheckCircle className="w-6 h-6 text-slate-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">참여 학생 서명</h2>
                                <p className="text-slate-500 text-sm">이 건의를 함께 만든 친구들이에요</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl text-center mb-6">
                            <p className="text-slate-700 font-bold">"우리는 모든 친구들이 <span className="text-blue-600">불편함 없이</span> 학교생활을 할 수 있기를 바라며, 이 건의서를 교장선생님께 정중히 제출합니다."</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {students.length > 0 ? (
                                students.map((s) => (
                                    <div key={s.id} className="bg-white border-2 border-slate-100 rounded-lg p-4 text-center hover:border-blue-200 transition-colors">
                                        <p className="font-bold text-slate-800 text-lg mb-1">{s.nickname}</p>
                                        <span className="text-2xl">✍️</span>
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-4 text-center text-muted-foreground py-4">참여한 학생이 없습니다.</p>
                            )}
                        </div>

                        <div className="mt-8 flex justify-center gap-12 text-center text-sm text-slate-500 font-medium">
                            <div>
                                <p className="mb-1 text-slate-400">학교</p>
                                <p className="text-slate-800 text-base">서울숭인초등학교</p>
                            </div>
                            <div>
                                <p className="mb-1 text-slate-400">참여 학생</p>
                                <p className="text-slate-800 text-base">{students.length}명</p>
                            </div>
                            <div>
                                <p className="mb-1 text-slate-400">작성일</p>
                                <p className="text-slate-800 text-base">2024년 12월</p>
                            </div>
                        </div>
                    </section>

                    {/* Footer: Teacher Sign */}
                    <section className="bg-slate-50 rounded-xl p-8 text-center border-t border-slate-200 mt-12">
                        <div className="flex items-center gap-2 justify-center mb-4">
                            <Users className="w-5 h-5 text-slate-400" />
                            <h3 className="font-bold text-slate-700">지도 교사 확인</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-8">학생들의 활동을 지도하고 확인합니다.</p>

                        <div className="inline-block border-b-2 border-slate-800 pb-2 px-12">
                            <span className="text-2xl font-serif font-bold tracking-widest text-slate-800 mr-4">____ 선생님</span>
                            <span className="text-slate-400 font-serif">(서명)</span>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default DiscussionReport;
