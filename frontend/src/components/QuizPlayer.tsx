import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizPlayerProps {
    socket: Socket;
}

interface Question {
    question: string;
    options: string[];
}

const QuizPlayer = ({ socket }: QuizPlayerProps) => {
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    useEffect(() => {
        // Request first question
        socket.emit('getQuestion');

        socket.on('question', (q: Question) => {
            setCurrentQuestion(q);
            setFeedback(null);
        });

        socket.on('correct', () => {
            setFeedback('correct');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                // In speed quiz mode, we don't request the next question manually anymore, 
                // but we keep the feedback for a moment.
                // The next question comes automatically via 'question' event.
            }, 1000);
        });



        socket.on('incorrect', () => {
            setFeedback('incorrect');
            setTimeout(() => {
                setFeedback(null);
            }, 1000);
        });

        socket.on('finished', () => {
            setIsFinished(true);
        });

        return () => {
            socket.off('question');
            socket.off('correct');
            socket.off('incorrect');
            socket.off('finished');
        };
    }, [socket]);

    const handleAnswer = (answer: string) => {
        socket.emit('submitAnswer', { answer });
    };

    if (isFinished) {
        return (
            <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">완주 성공!</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-xl mb-4">축하합니다! 모든 문제를 맞추셨습니다.</p>
                        <div className="text-6xl">🎉</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-xl">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((option, index) => (
                            <Button
                                key={index}
                                variant={feedback === 'incorrect' ? 'destructive' : 'outline'}
                                className={`h-16 text-lg ${feedback === 'correct' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                                onClick={() => handleAnswer(option)}
                                disabled={feedback !== null}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                    {feedback === 'correct' && (
                        <p className="text-center text-green-600 font-bold animate-bounce">정답입니다!</p>
                    )}
                    {feedback === 'incorrect' && (
                        <p className="text-center text-red-600 font-bold animate-shake">틀렸습니다. 다시 시도하세요.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default QuizPlayer;
