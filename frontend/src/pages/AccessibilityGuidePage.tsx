import { useState, useEffect } from 'react';
import { fetchSurveyData, SurveyResponse } from '@/api/survey';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, ArrowLeft, Save, Send } from 'lucide-react';
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
        const loadSurveyData = async () => {
            try {
                const fetchedData = await fetchSurveyData();
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
            } catch (error) {
                console.error("Failed to fetch survey data", error);
            }
        };
        loadSurveyData();
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

    const handleSubmit = () => {
        alert("접근성 가이드가 성공적으로 제출되었습니다!");
    };

    if (!isEditing) {
        return (
            <div className="min-h-screen bg-white p-8 print:p-0">
                <div className="max-w-4xl mx-auto print:max-w-none space-y-8">
                    <div className="flex justify-between items-center print:hidden mb-8">
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> 수정하기
                        </Button>
                        <div className="flex gap-2">
                            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                                <Send className="mr-2 h-4 w-4" /> 제출하기
                            </Button>
                            <Button onClick={handlePrint} variant="secondary">
                                <Printer className="mr-2 h-4 w-4" /> 인쇄하기
                            </Button>
                        </div>
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
                                    {surveyData.length === 0 ? (
                                        <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed">
                                            <p className="text-lg text-gray-500">아직 수집된 데이터가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {surveyData.map((item) => (
                                                <div key={item.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all break-inside-avoid">
                                                    <div className="flex justify-between items-start mb-3 border-b pb-3">
                                                        <div>
                                                            <h4 className="font-bold text-lg text-slate-800">{item.team_name}</h4>
                                                            <p className="text-sm text-slate-500 font-medium">
                                                                {item.building} {String(item.floor).replace(/층$/, '')}층
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 text-sm">
                                                        <div className="space-y-2">
                                                            <div className="bg-slate-50 p-2 rounded flex justify-between items-center">
                                                                <span className="text-xs text-slate-400">성별</span>
                                                                <span className="font-medium text-slate-700 text-right">{item.gender}</span>
                                                            </div>
                                                            <div className="bg-slate-50 p-2 rounded flex justify-between items-center">
                                                                <span className="text-xs text-slate-400">출입문</span>
                                                                <span className="font-medium text-slate-700 text-right">{item.door_type}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded">
                                                            <span className="text-xs text-slate-400 shrink-0">면적(cm)</span>
                                                            <span className="font-medium text-slate-700">{item.width} x {item.height}</span>
                                                        </div>

                                                        <div className="space-y-1 pt-1">
                                                            <div className="flex justify-between border-b border-dashed pb-1">
                                                                <span className="text-slate-500">손잡이</span>
                                                                <span className="font-medium text-slate-700">
                                                                    {(() => {
                                                                        const h = String(item.handrail_types || '').toLowerCase();
                                                                        const types = [];
                                                                        if (h.includes('l')) types.push('L자형');
                                                                        if (h.includes('u')) types.push('U자형');
                                                                        if (h.includes('move') || h.includes('folding') || h.includes('가동')) types.push('가동식');
                                                                        if (h.includes('fix') || h.includes('고정')) types.push('고정식');
                                                                        if (h.includes('other') || h.includes('기타')) types.push('기타');

                                                                        if (types.length > 0) return types.join(', ');
                                                                        if (!item.handrail_types || h === 'none') return '없음';
                                                                        return item.handrail_types === 'other' ? '기타' : item.handrail_types;
                                                                    })()}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-dashed pb-1">
                                                                <span className="text-slate-500">세면대</span>
                                                                <span className="font-medium text-slate-700">
                                                                    {['yes', '있음', 'y'].some(v => String(item.has_sink).toLowerCase().includes(v)) ? '있음' : '없음'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between pt-1">
                                                                <span className="text-slate-500">세면대 높이</span>
                                                                <span className="font-medium text-slate-700">
                                                                    {(() => {
                                                                        const h = String(item.sink_height).toLowerCase();
                                                                        if (h.includes('high')) return '높음';
                                                                        if (h.includes('low')) return '낮음';
                                                                        if (h.includes('appropriate') || h.includes('good') || h.includes('ok')) return '적당함';
                                                                        return item.sink_height || '-';
                                                                    })()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {data.restrooms.map((restroom) => (
                                    <div key={restroom.id} className="space-y-4">
                                        <h3 className="text-xl font-semibold text-blue-800">장애인 화장실 ({restroom.building ? `${restroom.building} - ` : ''}{restroom.gender})</h3>
                                        <ul className="list-disc list-inside space-y-2 text-lg">
                                            <li>위치: <strong>{restroom.building}</strong> {restroom.floor ? `${String(restroom.floor).replace(/층$/, '')}층` : ''}</li>
                                            <li>구분: <strong>{restroom.gender}</strong> 화장실</li>
                                            <li>출입문 형태: <strong>{restroom.doorType}</strong></li>
                                            <li>내부 크기: 가로 <strong>{restroom.width || '-'}</strong> x 세로 <strong>{restroom.height || '-'}</strong></li>
                                            <li>손잡이: <strong>{(() => {
                                                if (!restroom.handrailTypes) return '정보 없음';
                                                return restroom.handrailTypes.replace(/other/gi, '기타');
                                            })()}</strong></li>
                                            <li>세면대: <strong>{restroom.hasSink || '-'}</strong> (높이: {(() => {
                                                const h = String(restroom.sinkHeight || '').toLowerCase();
                                                if (h.includes('high') || h === '높음') return '높음';
                                                if (h.includes('low') || h === '낮음') return '낮음';
                                                if (h.includes('appropriate') || h.includes('good') || h === '적당함') return '적당함';
                                                return restroom.sinkHeight || '-';
                                            })()}) / 세면가능여부: <strong>{restroom.canWash || '-'}</strong></li>
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
                        <CardTitle>학생들이 수집한 화장실 데이터</CardTitle>
                        <p className="text-sm text-gray-500">학생들이 직접 탐사하고 기록한 데이터입니다.</p>
                    </CardHeader>
                    <CardContent>
                        {surveyData.length === 0 ? (
                            <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed">
                                <p className="text-lg text-gray-500">아직 수집된 데이터가 없습니다.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {surveyData.map((item) => (
                                    <div key={item.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-3 border-b pb-3">
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800">{item.team_name}</h4>
                                                <p className="text-sm text-slate-500 font-medium">
                                                    {item.building} {String(item.floor).replace(/층$/, '')}층
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            <div className="space-y-2">
                                                <div className="bg-slate-50 p-2 rounded flex justify-between items-center">
                                                    <span className="text-xs text-slate-400">성별</span>
                                                    <span className="font-medium text-slate-700 text-right">{item.gender}</span>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded flex justify-between items-center">
                                                    <span className="text-xs text-slate-400">출입문</span>
                                                    <span className="font-medium text-slate-700 text-right">{item.door_type}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded">
                                                <span className="text-xs text-slate-400 shrink-0">면적(cm)</span>
                                                <span className="font-medium text-slate-700">{item.width} x {item.height}</span>
                                            </div>

                                            <div className="space-y-1 pt-1">
                                                <div className="flex justify-between border-b border-dashed pb-1">
                                                    <span className="text-slate-500">손잡이</span>
                                                    <span className="font-medium text-slate-700">
                                                        {(() => {
                                                            const h = String(item.handrail_types || '').toLowerCase();
                                                            const types = [];
                                                            if (h.includes('l')) types.push('L자형');
                                                            if (h.includes('u')) types.push('U자형');
                                                            if (h.includes('move') || h.includes('folding') || h.includes('가동')) types.push('가동식');
                                                            if (h.includes('fix') || h.includes('고정')) types.push('고정식');
                                                            if (h.includes('other') || h.includes('기타')) types.push('기타');

                                                            if (types.length > 0) return types.join(', ');
                                                            if (!item.handrail_types || h === 'none') return '없음';
                                                            return item.handrail_types === 'other' ? '기타' : item.handrail_types;
                                                        })()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-dashed pb-1">
                                                    <span className="text-slate-500">세면대</span>
                                                    <span className="font-medium text-slate-700">
                                                        {['yes', '있음', 'y'].some(v => String(item.has_sink).toLowerCase().includes(v)) ? '있음' : '없음'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between pt-1">
                                                    <span className="text-slate-500">세면대 높이</span>
                                                    <span className="font-medium text-slate-700">
                                                        {(() => {
                                                            const h = String(item.sink_height).toLowerCase();
                                                            if (h.includes('high')) return '높음';
                                                            if (h.includes('low')) return '낮음';
                                                            if (h.includes('appropriate') || h.includes('good') || h.includes('ok')) return '적당함';
                                                            return item.sink_height || '-';
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>


                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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

                <div className="flex justify-center pb-12">
                    <Button onClick={() => { setIsEditing(false); window.scrollTo(0, 0); }} size="lg" className="w-full md:w-auto text-lg h-14">
                        <Save className="mr-2 h-5 w-5" /> 작성완료
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityGuidePage;
