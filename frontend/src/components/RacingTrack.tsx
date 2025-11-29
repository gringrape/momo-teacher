import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Student {
    id: string;
    nickname: string;
}

interface RacingTrackProps {
    students: Student[];
    progress: Record<string, number>;
    totalQuestions: number;
}

const RacingTrack = ({ students, progress, totalQuestions }: RacingTrackProps) => {
    return (
        <div className="space-y-6 w-full max-w-4xl mx-auto">
            {students.map((student) => {
                return (
                    <div key={student.id} className="relative">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="font-bold w-24 truncate">{student.nickname}</span>
                            <div className="flex-1 relative h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                {/* Track lines */}
                                <div className="absolute inset-0 flex justify-between px-2">
                                    {[...Array(totalQuestions)].map((_, i) => (
                                        <div key={i} className="h-full w-px bg-slate-300/50" style={{ left: `${(i / totalQuestions) * 100}%` }}></div>
                                    ))}
                                </div>

                                {/* Finish line */}
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-checkerboard opacity-50"></div>

                                {/* Avatar */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out"
                                    style={{ left: `${Math.min(((progress[student.id] || 0) / totalQuestions) * 100, 95)}%` }}
                                >
                                    <Avatar className="w-10 h-10 border-2 border-white shadow-lg">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {student.nickname[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            <style>{`
        .bg-checkerboard {
            background-image: linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%);
            background-size: 10px 10px;
            background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
        }
      `}</style>
        </div>
    );
};

export default RacingTrack;
