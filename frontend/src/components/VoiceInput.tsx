import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send } from 'lucide-react';

interface VoiceInputProps {
    onSubmit: (text: string) => void;
    isSubmitting?: boolean;
}

const VoiceInput = ({ onSubmit, isSubmitting = false }: VoiceInputProps) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'ko-KR';

            recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPart = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        currentTranscript += transcriptPart;
                    } else {
                        currentTranscript += transcriptPart;
                    }
                }
                setTranscript(currentTranscript);
            };

            recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
            setTranscript('');
        }
    };

    const handleSubmit = () => {
        if (transcript.trim()) {
            onSubmit(transcript);
            setTranscript('');
            if (isListening && recognition) {
                recognition.stop();
                setIsListening(false);
            }
        }
    };

    if (!recognition) {
        return <div className="text-red-500">이 브라우저는 음성 인식을 지원하지 않습니다.</div>;
    }

    return (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
            <div className="min-h-[100px] p-4 bg-secondary rounded-lg border border-border">
                {transcript || <span className="text-muted-foreground">마이크 버튼을 누르고 말씀하세요...</span>}
            </div>

            <div className="flex gap-2 justify-center">
                <Button
                    variant={isListening ? "destructive" : "default"}
                    size="lg"
                    className="rounded-full w-16 h-16 flex items-center justify-center"
                    onClick={toggleListening}
                >
                    {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </Button>

                {transcript && (
                    <Button
                        size="lg"
                        className="rounded-full w-16 h-16 flex items-center justify-center bg-green-600 hover:bg-green-700"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Send className="w-8 h-8" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default VoiceInput;
