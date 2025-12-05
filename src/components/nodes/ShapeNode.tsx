import { useState, useRef, useEffect } from 'react';
import { NodeProps, NodeResizeControl, Position, useReactFlow } from '@xyflow/react';
import { SmartHandle } from '../SmartHandle';

export function ShapeNode({ id, data, selected }: NodeProps<any>) {
    const { updateNodeData } = useReactFlow();
    const [text, setText] = useState(data.text || '');
    const [isEditing, setIsEditing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const shapeType = data.shapeType || 'rectangle';
    const color = data.color || '#e2e8f0'; // Default gray-200

    useEffect(() => {
        setText(data.text || '');
    }, [data.text]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setText(val);
        updateNodeData(id, { text: val });
    };

    const getShapeStyles = () => {
        switch (shapeType) {
            case 'circle': return { borderRadius: '50%' };
            case 'rectangle': return { borderRadius: '8px' };
            case 'triangle': return { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' };
            case 'diamond': return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
            case 'hexagon': return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
            default: return { borderRadius: '8px' };
        }
    };

    const shapeStyles = getShapeStyles();

    // Adjust text container for weird shapes
    const textPadding = shapeType === 'triangle' ? 'pt-8' : 'p-4';

    return (
        <>
            <NodeResizeControl variant={"line" as any} position={Position.Top} className="!h-2 !-top-1 !opacity-0 cursor-n-resize" />
            <NodeResizeControl variant={"line" as any} position={Position.Bottom} className="!h-2 !-bottom-1 !opacity-0 cursor-s-resize" />
            <NodeResizeControl variant={"line" as any} position={Position.Left} className="!w-2 !-left-1 !opacity-0 cursor-w-resize" />
            <NodeResizeControl variant={"line" as any} position={Position.Right} className="!w-2 !-right-1 !opacity-0 cursor-e-resize" />

            <div className={`relative w-full h-full group ${selected ? 'ring-2 ring-blue-500' : ''}`}
                style={{ ...shapeStyles, backgroundColor: color }}
                onDoubleClick={() => setIsEditing(true)}
            >
                <SmartHandle nodeId={id} position={Position.Top} isVisible={selected} />
                <SmartHandle nodeId={id} position={Position.Bottom} isVisible={selected} />
                <SmartHandle nodeId={id} position={Position.Left} isVisible={selected} />
                <SmartHandle nodeId={id} position={Position.Right} isVisible={selected} />

                <div className={`w-full h-full flex items-center justify-center overflow-hidden ${textPadding}`}>
                    {isEditing ? (
                        <textarea
                            ref={textareaRef}
                            className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-center text-gray-800 font-medium outline-none"
                            value={text}
                            onChange={handleTextChange}
                            onBlur={() => setIsEditing(false)}
                            onKeyDown={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    ) : (
                        <div className="w-full text-center text-gray-800 font-medium break-words whitespace-pre-wrap pointer-events-none">
                            {text}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
