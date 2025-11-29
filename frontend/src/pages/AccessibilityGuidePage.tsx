import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Printer, ArrowLeft, Save } from 'lucide-react';

interface GuideData {
    schoolName: string;
    authorName: string;
    date: string;

    elevatorBuilding: string;
    elevatorFloorsStart: string;
    elevatorFloorsEnd: string;
    elevatorType: string;
    elevatorImage: string | null;

    restroomBuilding: string;
    restroomMenFloor: string;
    restroomWomenFloor: string;
    restroomDoorType: string;
    restroomWidth: string;
    restroomHeight: string;
    restroomImageMen: string | null;
    restroomImageWomen: string | null;

    inaccessibleAreas: string;
    otherInfo: string;
    contactInfo: string;

    ruleRestroom: string;
    ruleElevatorPolicy: string;
    ruleRestroomPolicy: string;
    ruleInaccessibleSolution: string;
    ruleMovementSolution: string;
}

const AccessibilityGuidePage = () => {
    const [isEditing, setIsEditing] = useState(true);
    const [data, setData] = useState<GuideData>({
        schoolName: '',
        authorName: '',
        date: new Date().toISOString().split('T')[0],
        elevatorBuilding: '',
        elevatorFloorsStart: '',
        elevatorFloorsEnd: '',
        elevatorType: '누구나 탈 수 있음',
        elevatorImage: null,
        restroomBuilding: '',
        restroomMenFloor: '',
        restroomWomenFloor: '',
        restroomDoorType: '자동문',
        restroomWidth: '',
        restroomHeight: '',
        restroomImageMen: null,
        restroomImageWomen: null,
        inaccessibleAreas: '',
        otherInfo: '',
        contactInfo: '',
        ruleRestroom: '',
        ruleElevatorPolicy: '',
        ruleRestroomPolicy: '',
        ruleInaccessibleSolution: '',
        ruleMovementSolution: ''
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof GuideData) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (field: keyof GuideData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handlePrint = () => {
        window.print();
    };

    if (!isEditing) {
        return (
            <div className="min-h-screen bg-white p-8 print:p-0">
                <div className="max-w-4xl mx-auto print:max-w-none space-y-8">
                    <div className="flex justify-between items-center print:hidden mb-8">
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> 수정하기
                        </Button>
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> 인쇄하기
                        </Button>
                    </div>

                    <div className="text-center space-y-4 border-b-2 border-black pb-8">
                        <h1 className="text-4xl font-bold">모모탐사대: 우리 학교 휠체어 접근성 가이드</h1>
                        <div className="flex justify-center gap-8 text-xl">
                            <p><strong>학교명:</strong> {data.schoolName}</p>
                            <p><strong>작성자:</strong> {data.authorName}</p>
                            <p><strong>작성일:</strong> {data.date}</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-4">1. 학교 휠체어 접근성 기본 요소</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-blue-800">엘리베이터</h3>
                                    <ul className="list-disc list-inside space-y-2 text-lg">
                                        <li>위치: <strong>{data.elevatorBuilding}</strong> 건물</li>
                                        <li>운영 층: <strong>{data.elevatorFloorsStart}층</strong> ~ <strong>{data.elevatorFloorsEnd}층</strong></li>
                                        <li>운영 방식: <strong>{data.elevatorType}</strong></li>
                                    </ul>
                                    {data.elevatorImage && (
                                        <div className="mt-4 border rounded p-2">
                                            <p className="text-sm text-gray-500 mb-1">엘리베이터/평면도</p>
                                            <img src={data.elevatorImage} alt="엘리베이터" className="max-h-60 object-contain" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-blue-800">장애인 화장실</h3>
                                    <ul className="list-disc list-inside space-y-2 text-lg">
                                        <li>위치: <strong>{data.restroomBuilding}</strong> 건물</li>
                                        <li>남자 화장실: <strong>{data.restroomMenFloor}층</strong></li>
                                        <li>여자 화장실: <strong>{data.restroomWomenFloor}층</strong></li>
                                        <li>출입문 형태: <strong>{data.restroomDoorType}</strong></li>
                                        <li>내부 크기: 가로 <strong>{data.restroomWidth}</strong> x 세로 <strong>{data.restroomHeight}</strong></li>
                                    </ul>
                                    <div className="flex gap-2 mt-4">
                                        {data.restroomImageMen && (
                                            <div className="border rounded p-2 flex-1">
                                                <p className="text-sm text-gray-500 mb-1">남자 화장실</p>
                                                <img src={data.restroomImageMen} alt="남자 화장실" className="w-full h-40 object-cover" />
                                            </div>
                                        )}
                                        {data.restroomImageWomen && (
                                            <div className="border rounded p-2 flex-1">
                                                <p className="text-sm text-gray-500 mb-1">여자 화장실</p>
                                                <img src={data.restroomImageWomen} alt="여자 화장실" className="w-full h-40 object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-gray-50 p-6 rounded-lg print:bg-transparent print:p-0">
                            <h3 className="text-xl font-semibold text-red-800 mb-3">휠체어 접근이 불가능한 공간</h3>
                            <p className="text-lg whitespace-pre-wrap">{data.inaccessibleAreas || '없음'}</p>
                        </section>

                        <section className="bg-gray-50 p-6 rounded-lg print:bg-transparent print:p-0">
                            <h3 className="text-xl font-semibold text-green-800 mb-3">추가 접근성 정보 (참고 사항)</h3>
                            <p className="text-lg whitespace-pre-wrap">{data.otherInfo || '없음'}</p>
                        </section>

                        <section className="bg-gray-50 p-6 rounded-lg print:bg-transparent print:p-0">
                            <h3 className="text-xl font-semibold text-purple-800 mb-3">접근성 관련 문의처</h3>
                            <p className="text-lg whitespace-pre-wrap">{data.contactInfo || '정보 없음'}</p>
                        </section>

                        <div className="break-before-page"></div>

                        <section>
                            <h2 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-6 mt-8">2. 모모탐사대: 우리 학교 접근성 규칙 점검</h2>

                            <div className="space-y-6">
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h4 className="font-bold text-lg mb-2">Q. 우리 학교의 장애인 화장실 이용 규칙이 있나요?</h4>
                                    <p className="text-lg whitespace-pre-wrap">{data.ruleRestroom || '-'}</p>
                                </div>

                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h4 className="font-bold text-lg mb-2">Q. 우리 학교의 엘리베이터 운영 정책이 있나요? (개선점)</h4>
                                    <p className="text-lg whitespace-pre-wrap">{data.ruleElevatorPolicy || '-'}</p>
                                </div>

                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h4 className="font-bold text-lg mb-2">Q. 장애인 화장실 이용 규칙은 어떻게 만들면 좋을까요?</h4>
                                    <p className="text-lg whitespace-pre-wrap">{data.ruleRestroomPolicy || '-'}</p>
                                </div>

                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h4 className="font-bold text-lg mb-2">Q. 접근이 불가능한 특별실이 있는 경우, 어떻게 해결할 수 있을까요?</h4>
                                    <p className="text-lg whitespace-pre-wrap">{data.ruleInaccessibleSolution || '-'}</p>
                                </div>

                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h4 className="font-bold text-lg mb-2">Q. 학교 내 이동 경로에서 휠체어 이용 학생들이 자주 겪는 문제와 해결방안은?</h4>
                                    <p className="text-lg whitespace-pre-wrap">{data.ruleMovementSolution || '-'}</p>
                                </div>
                            </div>
                        </section>

                        <div className="text-center pt-12 pb-8 text-gray-500">
                            <p>이 가이드는 모모탐사대 활동을 통해 작성되었습니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 max-w-3xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">접근성 가이드 작성</h1>
                <Button onClick={() => setIsEditing(false)} size="lg">
                    <Save className="mr-2 h-4 w-4" /> 작성 완료
                </Button>
            </div>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>기본 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>학교명</Label>
                            <Input value={data.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} placeholder="예: 모모초등학교" />
                        </div>
                        <div className="space-y-2">
                            <Label>작성자 이름</Label>
                            <Input value={data.authorName} onChange={(e) => handleChange('authorName', e.target.value)} placeholder="예: 김교사" />
                        </div>
                        <div className="space-y-2">
                            <Label>작성 날짜</Label>
                            <Input type="date" value={data.date} onChange={(e) => handleChange('date', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>엘리베이터 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>엘리베이터 위치 (건물명)</Label>
                            <Input value={data.elevatorBuilding} onChange={(e) => handleChange('elevatorBuilding', e.target.value)} placeholder="예: 본관" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>운영 시작 층</Label>
                                <Input value={data.elevatorFloorsStart} onChange={(e) => handleChange('elevatorFloorsStart', e.target.value)} placeholder="1" />
                            </div>
                            <div className="space-y-2">
                                <Label>운영 끝 층</Label>
                                <Input value={data.elevatorFloorsEnd} onChange={(e) => handleChange('elevatorFloorsEnd', e.target.value)} placeholder="5" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>운영 방식</Label>
                            <RadioGroup value={data.elevatorType} onValueChange={(v) => handleChange('elevatorType', v)}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="누구나 탈 수 있음" id="e1" />
                                    <Label htmlFor="e1">누구나 탈 수 있음</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="교사와 장애구성원만 탈수 있음" id="e2" />
                                    <Label htmlFor="e2">교사와 장애구성원만 탈수 있음</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="필요할 때만 열쇠를 제공함" id="e3" />
                                    <Label htmlFor="e3">필요할 때만 열쇠를 제공함</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label>엘리베이터/평면도 사진</Label>
                            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'elevatorImage')} />
                            {data.elevatorImage && <img src={data.elevatorImage} alt="Preview" className="h-20 object-contain border rounded" />}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>장애인 화장실 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>화장실 위치 (건물명)</Label>
                            <Input value={data.restroomBuilding} onChange={(e) => handleChange('restroomBuilding', e.target.value)} placeholder="예: 신관" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>남자 화장실 층수</Label>
                                <Input value={data.restroomMenFloor} onChange={(e) => handleChange('restroomMenFloor', e.target.value)} placeholder="1" />
                            </div>
                            <div className="space-y-2">
                                <Label>여자 화장실 층수</Label>
                                <Input value={data.restroomWomenFloor} onChange={(e) => handleChange('restroomWomenFloor', e.target.value)} placeholder="1" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>출입문 형태</Label>
                            <RadioGroup value={data.restroomDoorType} onValueChange={(v) => handleChange('restroomDoorType', v)} className="grid grid-cols-2">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="자동문" id="d1" /><Label htmlFor="d1">자동문</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="버튼자동문" id="d2" /><Label htmlFor="d2">버튼자동문</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="여닫이문" id="d3" /><Label htmlFor="d3">여닫이문</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="미닫이문" id="d4" /><Label htmlFor="d4">미닫이문</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="폴딩 도어" id="d5" /><Label htmlFor="d5">폴딩 도어</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>너비 (가로)</Label>
                                <Input value={data.restroomWidth} onChange={(e) => handleChange('restroomWidth', e.target.value)} placeholder="예: 150cm" />
                            </div>
                            <div className="space-y-2">
                                <Label>높이 (세로)</Label>
                                <Input value={data.restroomHeight} onChange={(e) => handleChange('restroomHeight', e.target.value)} placeholder="예: 200cm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>남자 화장실 사진</Label>
                                <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'restroomImageMen')} />
                                {data.restroomImageMen && <img src={data.restroomImageMen} alt="Preview" className="h-20 object-contain border rounded" />}
                            </div>
                            <div className="space-y-2">
                                <Label>여자 화장실 사진</Label>
                                <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'restroomImageWomen')} />
                                {data.restroomImageWomen && <img src={data.restroomImageWomen} alt="Preview" className="h-20 object-contain border rounded" />}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>기타 접근성 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>휠체어 접근 불가능 공간</Label>
                            <Textarea value={data.inaccessibleAreas} onChange={(e) => handleChange('inaccessibleAreas', e.target.value)} placeholder="예: 특별실, 도서관, 체육관 등" />
                        </div>
                        <div className="space-y-2">
                            <Label>기타 참고 정보 (경사로 등)</Label>
                            <Textarea value={data.otherInfo} onChange={(e) => handleChange('otherInfo', e.target.value)} placeholder="예: 정문 앞에 경사가 있는 언덕이 있습니다." />
                        </div>
                        <div className="space-y-2">
                            <Label>접근성 관련 문의처</Label>
                            <Input value={data.contactInfo} onChange={(e) => handleChange('contactInfo', e.target.value)} placeholder="예: 행정실 02-123-4567" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="text-blue-800">모모탐사대: 우리 학교 접근성 규칙 점검</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Q. 우리 학교의 장애인 화장실 이용 규칙이 있나요?</Label>
                            <Textarea value={data.ruleRestroom} onChange={(e) => handleChange('ruleRestroom', e.target.value)} placeholder="의견을 적어주세요" className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Q. 우리 학교의 엘리베이터 운영 정책이 있나요? (개선점)</Label>
                            <Textarea value={data.ruleElevatorPolicy} onChange={(e) => handleChange('ruleElevatorPolicy', e.target.value)} placeholder="의견을 적어주세요" className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Q. 장애인 화장실 이용 규칙은 어떻게 만들면 좋을까요?</Label>
                            <Textarea value={data.ruleRestroomPolicy} onChange={(e) => handleChange('ruleRestroomPolicy', e.target.value)} placeholder="의견을 적어주세요" className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Q. 접근이 불가능한 특별실이 있는 경우, 어떻게 해결할 수 있을까요?</Label>
                            <Textarea value={data.ruleInaccessibleSolution} onChange={(e) => handleChange('ruleInaccessibleSolution', e.target.value)} placeholder="의견을 적어주세요" className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Q. 학교 내 이동 경로에서 휠체어 이용 학생들이 자주 겪는 문제와 해결방안은?</Label>
                            <Textarea value={data.ruleMovementSolution} onChange={(e) => handleChange('ruleMovementSolution', e.target.value)} placeholder="의견을 적어주세요" className="bg-white" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pb-12">
                    <Button onClick={() => setIsEditing(false)} size="lg" className="w-full md:w-auto text-lg h-14">
                        <Save className="mr-2 h-5 w-5" /> 가이드 완성하기
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityGuidePage;
