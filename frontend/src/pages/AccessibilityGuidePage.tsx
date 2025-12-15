import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, ArrowLeft, Save } from 'lucide-react';
import { RestroomCard } from '@/components/RestroomCard';

interface GuideData {
    schoolName: string;
    authorName: string;
    date: string;

    elevatorBuilding: string;
    elevatorFloorsStart: string;
    elevatorFloorsEnd: string;
    elevatorType: string;
    elevatorImage: string | null;

    restrooms: RestroomInfo[];

    inaccessibleAreas: string;
    otherInfo: string;
    contactInfo: string;
}

interface SurveyResponse {
    id: number;
    team_name: string;
    building: string;
    floor: string;
    gender: string;
    door_type: string;
    width: string;
    height: string;
    can_use_restroom: string;
    created_at: string;
    photos: string[] | null;
    team_members?: string;
    dream_school?: string;
    why_not_use?: string;
    handrail_types?: string;
    has_sink?: string;
    can_wash?: string;
    sink_height?: string;
}

interface RestroomInfo {
    id: string;
    building: string;
    floor: string;
    gender: string;
    doorType: string;
    width: string;
    height: string;
    selectedPhotos: (string | null)[];
    surveyPhotos: string[];
    handrailTypes: string;
    hasSink: string;
    canWash: string;
    sinkHeight: string;
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
        restrooms: [],
        inaccessibleAreas: '',
        otherInfo: '',
        contactInfo: ''
    });
    const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);

    useEffect(() => {
        const fetchSurveyData = async () => {
            try {
                const response = await fetch('/api/survey');
                if (response.ok) {
                    const fetchedData: SurveyResponse[] = await response.json();
                    setSurveyData(fetchedData);

                    // Normalize and Group by building AND floor AND gender
                    const groups: { [key: string]: SurveyResponse[] } = {};

                    fetchedData.forEach(item => {
                        const building = String(item.building || 'Unknown').trim();
                        const floor = String(item.floor || '?').trim();

                        // Robust Normalization for Gender
                        let rawGender = String(item.gender || '').trim().toLowerCase();
                        let gender = '남녀공용'; // default

                        if (rawGender.includes('공용') || rawGender.includes('남녀') || rawGender.includes('common') || rawGender.includes('unisex') || rawGender.includes('all')) {
                            gender = '남녀공용';
                        } else if (rawGender.includes('여') || rawGender.includes('female') || rawGender.includes('woman') || rawGender.includes('women') || rawGender.includes('girl')) {
                            gender = '여자';
                        } else if (rawGender.includes('남') || rawGender.includes('male') || rawGender.includes('man') || rawGender.includes('men') || rawGender.includes('boy')) {
                            gender = '남자';
                        } else {
                            if (item.gender === '남자' || item.gender === '여자') gender = item.gender;
                        }

                        // Robust Normalization for Door Type
                        let rawDoor = String(item.door_type || '').trim().toLowerCase();
                        let door = '자동문'; // default

                        if (rawDoor.includes('자동') || rawDoor.includes('auto')) door = '자동문';
                        if (rawDoor.includes('버튼') || rawDoor.includes('button')) door = '버튼자동문';
                        if (rawDoor.includes('여닫') || rawDoor.includes('swing') || rawDoor.includes('pull') || rawDoor.includes('push')) door = '여닫이문';
                        if (rawDoor.includes('미닫') || rawDoor.includes('sliding') || rawDoor.includes('slide')) door = '미닫이문';
                        if (rawDoor.includes('폴딩') || rawDoor.includes('folding') || rawDoor.includes('접는')) door = '폴딩 도어';
                        if (rawDoor.includes('버튼')) door = '버튼자동문';

                        // Normalize Handrail Types
                        let rawHandrail = String(item.handrail_types || '').trim().toLowerCase();
                        let handrail = rawHandrail; // default
                        if (rawHandrail.includes('l')) handrail = 'L자형';
                        else if (rawHandrail.includes('u')) handrail = 'U자형';
                        else if (rawHandrail.includes('가동') || rawHandrail.includes('move') || rawHandrail.includes('folding')) handrail = '가동식';
                        // Map back to original if normalization failed but value exists (safely)
                        if (!handrail && item.handrail_types) handrail = String(item.handrail_types);

                        // Normalize Has Sink
                        let rawSink = String(item.has_sink || '').trim().toLowerCase();
                        let hasSink = '없음';
                        if (['yes', 'y', 'o', 'true', '있음', '있'].some(v => rawSink.includes(v))) hasSink = '있음';
                        else if (['no', 'n', 'x', 'false', '없음', '없'].some(v => rawSink.includes(v))) hasSink = '없음';

                        // Normalize Can Wash
                        let rawWash = String(item.can_wash || '').trim().toLowerCase();
                        let canWash = '불가능';
                        if (['yes', 'possible', 'ok', 'true', '가능'].some(v => rawWash.includes(v))) canWash = '가능';
                        else if (['no', 'impossible', 'false', '불가능'].some(v => rawWash.includes(v))) canWash = '불가능';

                        // Normalize Sink Height
                        let rawHeight = String(item.sink_height || '').trim();
                        let sinkHeight = rawHeight;
                        if (/^\d+$/.test(rawHeight)) {
                            sinkHeight = `약 ${rawHeight}cm`;
                        }

                        const key = `${building}::${floor}::${gender}`;
                        if (!groups[key]) {
                            groups[key] = [];
                        }

                        // Use the normalized values
                        groups[key].push({
                            ...item,
                            gender: gender,
                            door_type: door,
                            handrail_types: handrail,
                            has_sink: hasSink,
                            can_wash: canWash,
                            sink_height: sinkHeight
                        });
                    });

                    // Create RestroomInfo objects
                    const restrooms: RestroomInfo[] = Object.keys(groups).map((key, index) => {
                        const group = groups[key];
                        const first = group[0];

                        // Collect all photos from this group
                        let allPhotos: string[] = [];
                        group.forEach(g => {
                            if (g.photos && Array.isArray(g.photos)) {
                                allPhotos = [...allPhotos, ...g.photos];
                            }
                        });

                        return {
                            id: `restroom-${index}`,
                            building: first.building || '',
                            floor: first.floor || '',
                            gender: first.gender || '남녀공용',
                            doorType: first.door_type || '자동문',
                            width: first.width || '',
                            height: first.height || '',
                            selectedPhotos: [null, null, null],
                            surveyPhotos: allPhotos,
                            handrailTypes: first.handrail_types || '',
                            hasSink: first.has_sink || '',
                            canWash: first.can_wash || '',
                            sinkHeight: first.sink_height || ''
                        };
                    });

                    setData(prev => ({ ...prev, restrooms }));
                }
            } catch (error) {
                console.error("Failed to fetch survey data", error);
            }
        };
        fetchSurveyData();
    }, []);

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

    const handleRestroomChange = (id: string, field: keyof RestroomInfo, value: string) => {
        setData(prev => ({
            ...prev,
            restrooms: prev.restrooms.map(r => r.id === id ? { ...r, [field]: value } : r)
        }));
    };

    const handlePhotoAction = (id: string, action: string, photoUrl: string) => {
        setData(prev => ({
            ...prev,
            restrooms: prev.restrooms.map(r => {
                if (r.id === id) {
                    const newPhotos = [...r.selectedPhotos];

                    if (action === 'addPhoto') {
                        const emptyIndex = newPhotos.findIndex(p => p === null);
                        if (emptyIndex !== -1) {
                            newPhotos[emptyIndex] = photoUrl;
                        } else {
                            alert("사진은 최대 3장까지 등록할 수 있습니다. 아래에서 삭제 후 다시 시도해주세요.");
                        }
                    } else if (action.startsWith('removePhoto')) {
                        const index = parseInt(action.replace('removePhoto', '')) - 1;
                        if (index >= 0 && index < 3) {
                            newPhotos[index] = null;
                        }
                    }
                    return { ...r, selectedPhotos: newPhotos };
                }
                return r;
            })
        }));
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

                                <div className="space-y-4 col-span-1 md:col-span-2">
                                    <h3 className="text-xl font-semibold text-blue-800 border-b pb-2">학생들이 수집한 화장실 데이터</h3>
                                    <div className="rounded-md border overflow-x-auto">
                                        <Table className="min-w-[1200px]">
                                            <TableHeader>
                                                <TableRow className="bg-gray-100">
                                                    <TableHead className="min-w-[100px]">팀명</TableHead>
                                                    <TableHead className="min-w-[80px]">위치</TableHead>
                                                    <TableHead className="min-w-[60px]">성별</TableHead>
                                                    <TableHead className="min-w-[80px]">출입문</TableHead>
                                                    <TableHead className="min-w-[100px]">크기</TableHead>
                                                    <TableHead className="min-w-[80px]">사용가능</TableHead>
                                                    <TableHead className="min-w-[100px]">손잡이</TableHead>
                                                    <TableHead className="min-w-[100px]">세면대정보</TableHead>
                                                    <TableHead className="min-w-[150px]">불편한점</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {surveyData.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="text-center h-24">
                                                            수집된 데이터가 없습니다.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    surveyData.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-medium">{item.team_name}</TableCell>
                                                            <TableCell>{item.building} {item.floor}층</TableCell>
                                                            <TableCell>{item.gender}</TableCell>
                                                            <TableCell>{item.door_type}</TableCell>
                                                            <TableCell>{item.width} x {item.height}</TableCell>
                                                            <TableCell>{item.can_use_restroom}</TableCell>
                                                            <TableCell>{item.handrail_types}</TableCell>
                                                            <TableCell>{item.has_sink} / {item.sink_height}</TableCell>
                                                            <TableCell>{item.why_not_use}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {data.restrooms.map((restroom) => (
                                    <div key={restroom.id} className="space-y-4">
                                        <h3 className="text-xl font-semibold text-blue-800">장애인 화장실 ({restroom.building} - {restroom.gender})</h3>
                                        <ul className="list-disc list-inside space-y-2 text-lg">
                                            <li>위치: <strong>{restroom.building}</strong> {restroom.floor}층</li>
                                            <li>구분: <strong>{restroom.gender}</strong> 화장실</li>
                                            <li>출입문 형태: <strong>{restroom.doorType}</strong></li>
                                            <li>내부 크기: 가로 <strong>{restroom.width}</strong> x 세로 <strong>{restroom.height}</strong></li>
                                            <li>손잡이: <strong>{restroom.handrailTypes || '정보 없음'}</strong></li>
                                            <li>세면대: <strong>{restroom.hasSink || '-'}</strong> (높이: {restroom.sinkHeight || '-'}) / 세면가능여부: <strong>{restroom.canWash || '-'}</strong></li>
                                        </ul>
                                        <div className="flex gap-4 mt-4 overflow-x-auto">
                                            {restroom.selectedPhotos.map((photo, idx) => (
                                                photo && (
                                                    <div key={idx} className="border rounded p-2 min-w-[200px] flex-1">
                                                        <p className="text-sm text-gray-500 mb-1">사진 {idx + 1}</p>
                                                        <img src={photo} alt={`Restroom ${idx + 1}`} className="w-full h-40 object-cover" />
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                ))}
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
                <div className="text-red-500 font-bold bg-yellow-100 p-2 rounded print:hidden">
                    DEBUG: Survey={surveyData.length}, Groups={data.restrooms.length}
                </div>
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
                        <CardTitle>학생들이 수집한 화장실 데이터</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[100px]">팀명</TableHead>
                                                <TableHead className="min-w-[80px]">위치</TableHead>
                                                <TableHead className="min-w-[60px]">성별</TableHead>
                                                <TableHead className="min-w-[80px]">출입문</TableHead>
                                                <TableHead className="min-w-[100px]">크기(가로x세로)</TableHead>
                                                <TableHead className="min-w-[80px]">사용가능</TableHead>
                                                <TableHead className="min-w-[120px]">팀원</TableHead>
                                                <TableHead className="min-w-[100px]">손잡이</TableHead>
                                                <TableHead className="min-w-[80px]">세면대</TableHead>
                                                <TableHead className="min-w-[80px]">세면가능</TableHead>
                                                <TableHead className="min-w-[80px]">세면대높이</TableHead>
                                                <TableHead className="min-w-[150px]">불편한점</TableHead>
                                                <TableHead className="min-w-[150px]">바라는학교</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {surveyData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={13} className="text-center h-24">
                                                        수집된 데이터가 없습니다.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                surveyData.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{item.team_name}</TableCell>
                                                        <TableCell>{item.building} {item.floor}층</TableCell>
                                                        <TableCell>{item.gender}</TableCell>
                                                        <TableCell>{item.door_type}</TableCell>
                                                        <TableCell>{item.width} x {item.height}</TableCell>
                                                        <TableCell>{item.can_use_restroom}</TableCell>
                                                        <TableCell>{item.team_members}</TableCell>
                                                        <TableCell>{item.handrail_types}</TableCell>
                                                        <TableCell>{item.has_sink}</TableCell>
                                                        <TableCell>{item.can_wash}</TableCell>
                                                        <TableCell>{item.sink_height}</TableCell>
                                                        <TableCell>{item.why_not_use}</TableCell>
                                                        <TableCell>{item.dream_school}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <h2 className="text-2xl font-bold pt-4">장애인 화장실 정보 입력</h2>

                {data.restrooms.map((restroom) => (
                    <RestroomCard
                        key={restroom.id}
                        data={restroom}
                        onChange={handleRestroomChange}
                        onPhotoAction={handlePhotoAction}
                    />
                ))}

                {data.restrooms.length === 0 && (
                    <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed">
                        <p className="text-lg text-gray-500">학생들이 수집한 화장실 데이터가 없습니다.</p>
                        <p className="text-sm text-gray-400 mt-2">화장실 정보가 추가되면 이곳에 입력 카드가 자동으로 생성됩니다.</p>
                    </div>
                )}

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
