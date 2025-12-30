import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

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

interface RestroomCardProps {
    data: RestroomInfo;
    onChange: (id: string, field: keyof RestroomInfo, value: string) => void;
    onPhotoAction: (id: string, action: 'addPhoto' | 'removePhoto1' | 'removePhoto2' | 'removePhoto3' | 'delete', photoUrl: string) => void;
}

export const RestroomCard = ({ data, onChange, onPhotoAction }: RestroomCardProps) => {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>{data.building} {data.floor.includes('층') ? data.floor : `${data.floor}층`} 화장실</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>위치 (층수)</Label>
                        <Input type="number" value={data.floor} onChange={(e) => onChange(data.id, 'floor', e.target.value)} placeholder="1" />
                    </div>
                    <div className="space-y-2">
                        <Label>화장실 구분</Label>
                        <RadioGroup value={data.gender} onValueChange={(v) => onChange(data.id, 'gender', v)} className="flex gap-4 pt-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="남자" id={`g1-${data.id}`} /><Label htmlFor={`g1-${data.id}`}>남자</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="여자" id={`g2-${data.id}`} /><Label htmlFor={`g2-${data.id}`}>여자</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="남녀공용" id={`g3-${data.id}`} /><Label htmlFor={`g3-${data.id}`}>남녀공용</Label></div>
                        </RadioGroup>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>출입문 형태</Label>
                    <RadioGroup value={data.doorType} onValueChange={(v) => onChange(data.id, 'doorType', v)} className="grid grid-cols-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="자동문" id={`d1-${data.id}`} /><Label htmlFor={`d1-${data.id}`}>자동문</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="버튼자동문" id={`d2-${data.id}`} /><Label htmlFor={`d2-${data.id}`}>버튼자동문</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="여닫이문" id={`d3-${data.id}`} /><Label htmlFor={`d3-${data.id}`}>여닫이문</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="미닫이문" id={`d4-${data.id}`} /><Label htmlFor={`d4-${data.id}`}>미닫이문</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="폴딩 도어" id={`d5-${data.id}`} /><Label htmlFor={`d5-${data.id}`}>폴딩 도어</Label></div>
                    </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>가로(cm)</Label>
                        <Input value={data.width} onChange={(e) => onChange(data.id, 'width', e.target.value)} placeholder="예: 150" />
                    </div>
                    <div className="space-y-2">
                        <Label>세로(cm)</Label>
                        <Input value={data.height} onChange={(e) => onChange(data.id, 'height', e.target.value)} placeholder="예: 200" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>안전 손잡이 종류 (중복 선택 가능)</Label>
                    <div className="grid grid-cols-2 gap-y-2">
                        {['L자형', 'U자형', '가동식', '고정식', '기타'].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`handrail-${data.id}-${type}`}
                                    checked={data.handrailTypes.includes(type)}
                                    onCheckedChange={(checked) => {
                                        const currentTypes = data.handrailTypes ? data.handrailTypes.split(', ').filter(Boolean) : [];
                                        let newTypes;
                                        if (checked) {
                                            newTypes = [...currentTypes, type];
                                        } else {
                                            newTypes = currentTypes.filter(t => t !== type);
                                        }
                                        onChange(data.id, 'handrailTypes', newTypes.join(', '));
                                    }}
                                />
                                <Label htmlFor={`handrail-${data.id}-${type}`}>{type}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>세면대 유무</Label>
                        <RadioGroup value={data.hasSink} onValueChange={(v) => onChange(data.id, 'hasSink', v)} className="flex gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="있음" id={`s1-${data.id}`} /><Label htmlFor={`s1-${data.id}`}>있음</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="없음" id={`s2-${data.id}`} /><Label htmlFor={`s2-${data.id}`}>없음</Label></div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label>휠체어 세면 가능 여부</Label>
                        <RadioGroup value={data.canWash} onValueChange={(v) => onChange(data.id, 'canWash', v)} className="flex gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="가능" id={`w1-${data.id}`} /><Label htmlFor={`w1-${data.id}`}>가능</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="불가능" id={`w2-${data.id}`} /><Label htmlFor={`w2-${data.id}`}>불가능</Label></div>
                        </RadioGroup>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>세면대 높이</Label>
                    <RadioGroup value={data.sinkHeight} onValueChange={(v) => onChange(data.id, 'sinkHeight', v)} className="flex gap-4">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="높음" id={`sh1-${data.id}`} /><Label htmlFor={`sh1-${data.id}`}>높음</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="적당함" id={`sh2-${data.id}`} /><Label htmlFor={`sh2-${data.id}`}>적당함</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="낮음" id={`sh3-${data.id}`} /><Label htmlFor={`sh3-${data.id}`}>낮음</Label></div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label>수집된 사진 (선택하여 슬롯에 등록)</Label>
                    {data.surveyPhotos.length > 0 ? (
                        <Carousel className="w-full max-w-sm mx-auto">
                            <CarouselContent>
                                {data.surveyPhotos.map((photo, index) => (
                                    <CarouselItem key={index}>
                                        <div className="p-1">
                                            <div className="border rounded-lg overflow-hidden relative group">
                                                <img src={photo} alt={`Survey ${index}`} className="w-full h-48 object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => onPhotoAction(data.id, 'addPhoto', photo)}>등록하기</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    ) : (
                        <p className="text-sm text-gray-500">수집된 사진이 없습니다.</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map((idx) => (
                        <div key={idx} className="space-y-2">
                            <Label>사진 {idx + 1}</Label>
                            {data.selectedPhotos[idx] ? (
                                <div className="relative">
                                    <img src={data.selectedPhotos[idx]!} alt={`Slot ${idx + 1}`} className="h-32 w-full object-cover rounded border" />
                                    <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => onPhotoAction(data.id, `removePhoto${idx + 1}` as any, '')}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-32 border rounded bg-gray-100 flex items-center justify-center text-gray-400">선택 안됨</div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
