import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface DiscussionResponse {
    nickname: string;
    text: string;
    questionIndex: number;
}

interface DiscussionQuestion {
    question: string;
    reason: string;
}

interface MindMapProps {
    questions: DiscussionQuestion[];
    responses: DiscussionResponse[];
}

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const MindMap = ({ questions, responses }: MindMapProps) => {
    const [nodes, setNodes] = useState<any[]>([]);
    const [edges, setEdges] = useState<any[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;

        const newNodes: any[] = [];
        const newEdges: any[] = [];

        // 1. Center Node
        newNodes.push({
            id: 'center',
            text: '우리의 생각',
            x: centerX,
            y: centerY,
            type: 'center',
            color: '#FF9F1C'
        });

        // 2. Question Nodes (Level 1)
        const questionRadius = Math.min(width, height) * 0.25;
        questions.forEach((q, i) => {
            const angle = (i / questions.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(angle) * questionRadius;
            const y = centerY + Math.sin(angle) * questionRadius;

            newNodes.push({
                id: `q-${i}`,
                text: `Q${i + 1}`, // Shorten for visual clarity, or use truncated question
                fullText: q.question,
                x,
                y,
                type: 'question',
                color: COLORS[i % COLORS.length]
            });

            newEdges.push({
                from: 'center',
                to: `q-${i}`,
                color: '#333'
            });

            // 3. Response Nodes (Level 2)
            const questionResponses = responses.filter(r => r.questionIndex === i);
            const responseRadius = Math.min(width, height) * 0.15; // Distance from question node

            questionResponses.forEach((r, j) => {
                // Spread responses in a fan shape around the question node, pointing away from center
                const baseAngle = angle;
                const spread = Math.PI / 2; // 90 degrees spread
                const offsetAngle = baseAngle - spread / 2 + (spread * (j + 1) / (questionResponses.length + 1));

                const rx = x + Math.cos(offsetAngle) * responseRadius;
                const ry = y + Math.sin(offsetAngle) * responseRadius;

                newNodes.push({
                    id: `r-${i}-${j}`,
                    text: r.text,
                    nickname: r.nickname,
                    x: rx,
                    y: ry,
                    type: 'response',
                    color: COLORS[i % COLORS.length] // Same color family as question
                });

                newEdges.push({
                    from: `q-${i}`,
                    to: `r-${i}-${j}`,
                    color: COLORS[i % COLORS.length]
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);

    }, [questions, responses]);

    return (
        <div ref={containerRef} className="w-full h-[800px] relative bg-slate-50 overflow-hidden rounded-xl border shadow-inner">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {edges.map((edge, i) => {
                    const fromNode = nodes.find(n => n.id === edge.from);
                    const toNode = nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    return (
                        <motion.line
                            key={i}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke={edge.color}
                            strokeWidth="2"
                        />
                    );
                })}
            </svg>

            {nodes.map((node, i) => (
                <motion.div
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: i * 0.1 }}
                    className={`absolute flex flex-col items-center justify-center text-center p-4 rounded-xl shadow-lg cursor-pointer hover:z-50 hover:scale-110 transition-transform`}
                    style={{
                        left: node.x,
                        top: node.y,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: node.type === 'response' ? '#fff' : node.color,
                        border: node.type === 'response' ? `2px solid ${node.color}` : 'none',
                        width: node.type === 'center' ? 200 : (node.type === 'question' ? 120 : 'auto'),
                        height: node.type === 'center' ? 120 : (node.type === 'question' ? 120 : 'auto'),
                        maxWidth: node.type === 'response' ? 200 : 'none',
                        zIndex: node.type === 'center' ? 20 : (node.type === 'question' ? 10 : 5)
                    }}
                    title={node.fullText || node.text}
                >
                    {node.type === 'center' && (
                        <h1 className="text-3xl font-black text-white">{node.text}</h1>
                    )}

                    {node.type === 'question' && (
                        <div className="font-bold text-white">
                            <div className="text-2xl mb-1">{node.text}</div>
                            <div className="text-xs opacity-90 line-clamp-3">{node.fullText}</div>
                        </div>
                    )}

                    {node.type === 'response' && (
                        <div className="text-sm">
                            <p className="font-medium text-slate-800 mb-1">"{node.text}"</p>
                            <p className="text-xs text-slate-500">- {node.nickname}</p>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default MindMap;
