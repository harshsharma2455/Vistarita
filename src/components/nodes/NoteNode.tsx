import { useState, useRef, useEffect } from 'react';
import {
    Position,
    NodeProps,
    Node,
    NodeToolbar,
    NodeResizeControl,
    useViewport,
    useReactFlow
} from '@xyflow/react';
import {
    Settings,
    Bold,
    Italic,
    AlignLeft,
    AlignCenter,
    AlignRight
} from 'lucide-react';
import { SmartHandle } from '../SmartHandle';

type NoteNodeData = {
    text?: string;
    color?: string;
    shadow?: string;
    bold?: boolean;
    italic?: boolean;
    align?: 'left' | 'center' | 'right';
};

type NoteNode = Node<NoteNodeData, 'note'>;

const PASTEL_COLORS = [
    '#FFFDF5', // Default Cream
    '#FFDEE9', // Pastel Pink
    '#B5FFFC', // Pastel Blue
    '#E0C3FC', // Pastel Purple
    '#D4FFEA', // Pastel Green
    '#FFF4BD', // Pastel Yellow
];

const SHADOW_OPTIONS = [
    'none',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Small
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Medium
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Large
    '0 20px 50px rgba(0,0,0,0.1)', // Soft Volumetric (Antigravity)
];

export function NoteNode({ id, data, selected }: NodeProps<NoteNode>) {
    const { zoom } = useViewport();
    const { updateNodeData } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scale = Math.min(2.5, Math.max(1, 1 / zoom));

    // Local state for immediate feedback, should sync with data
    const [text, setText] = useState(data.text || '');
    const [color, setColor] = useState(data.color || PASTEL_COLORS[0]);
    const [shadow, setShadow] = useState(data.shadow || SHADOW_OPTIONS[4]);
    const [isBold, setIsBold] = useState(data.bold || false);
    const [isItalic, setIsItalic] = useState(data.italic || false);
    const [textAlign, setTextAlign] = useState(data.align || 'left');

    useEffect(() => {
        setText(data.text || '');
        setColor(data.color || PASTEL_COLORS[0]);
        setShadow(data.shadow || SHADOW_OPTIONS[4]);
        setIsBold(data.bold || false);
        setIsItalic(data.italic || false);
        setTextAlign(data.align || 'left');
    }, [data]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [text, isEditing]);

    /*
    const handleCreateNode = useCallback((direction: 'top' | 'bottom' | 'left' | 'right') => {
        const currentNode = getNode(id);
        if (!currentNode) return;

        const offset = 300; // Distance for new node
        let newPos = { ...currentNode.position };
        let sourceHandleId = '';
        let targetHandleId = '';

        if (direction === 'top') {
            newPos.y -= offset;
            sourceHandleId = 'source-top';
            targetHandleId = 'target-bottom';
        }
        if (direction === 'bottom') {
            newPos.y += offset;
            sourceHandleId = 'source-bottom';
            targetHandleId = 'target-top';
        }
        if (direction === 'left') {
            newPos.x -= offset;
            sourceHandleId = 'source-left';
            targetHandleId = 'target-right';
        }
        if (direction === 'right') {
            newPos.x += offset;
            sourceHandleId = 'source-right';
            targetHandleId = 'target-left';
        }

        const newNodeId = Math.random().toString(36).substr(2, 9);
        const newNode: NoteNode = {
            id: newNodeId,
            type: 'note',
            position: newPos,
            data: {
                text: '',
                color: color,
                shadow: shadow
            },
        };

        addNodes(newNode);
        addEdges({
            id: `e-${id}-${newNodeId}`,
            source: id,
            target: newNodeId,
            sourceHandle: sourceHandleId,
            targetHandle: targetHandleId,
            type: 'default',
            style: { stroke: '#b1b1b7' },
        });
    }, [id, getNode, addNodes, addEdges, color, shadow]);
    */

    const handleStyleChange = (key: string, value: any) => {
        if (key === 'color') setColor(value);
        if (key === 'shadow') setShadow(value);
        if (key === 'bold') setIsBold(value);
        if (key === 'italic') setIsItalic(value);
        if (key === 'align') setTextAlign(value);

        updateNodeData(id, { [key]: value });
    };

    return (
        <>
            {/* Resize Controls - Full Borders */}
            <NodeResizeControl variant={"line" as any} position={Position.Top} className="!h-4 !-top-2 !opacity-0 cursor-n-resize" />
            <NodeResizeControl variant={"line" as any} position={Position.Bottom} className="!h-4 !-bottom-2 !opacity-0 cursor-s-resize" />
            <NodeResizeControl variant={"line" as any} position={Position.Left} className="!w-4 !-left-2 !opacity-0 cursor-w-resize" />
            <NodeResizeControl variant={"line" as any} position={Position.Right} className="!w-4 !-right-2 !opacity-0 cursor-e-resize" />

            {/* Resize Controls - Corners */}
            <NodeResizeControl variant={"handle" as any} className="!w-6 !h-6 !-top-3 !-left-3 !opacity-0 absolute top-0 left-0" />
            <NodeResizeControl variant={"handle" as any} className="!w-6 !h-6 !-top-3 !-right-3 !opacity-0 absolute top-0 right-0" />
            <NodeResizeControl variant={"handle" as any} className="!w-6 !h-6 !-bottom-3 !-left-3 !opacity-0 absolute bottom-0 left-0" />
            <NodeResizeControl variant={"handle" as any} className="!w-6 !h-6 !-bottom-3 !-right-3 !opacity-0 absolute bottom-0 right-0" />

            {/* Settings Toolbar */}
            <NodeToolbar isVisible={selected && showSettings} position={Position.Top} className="flex gap-2 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/50">
                {/* Colors */}
                <div className="flex gap-1 border-r border-gray-200 pr-2">
                    {PASTEL_COLORS.map(c => (
                        <button
                            key={c}
                            className={`w-6 h-6 rounded-full border border-gray-100 ${color === c ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => handleStyleChange('color', c)}
                        />
                    ))}
                </div>

                {/* Text Formatting */}
                <div className="flex gap-1 border-r border-gray-200 pr-2 text-gray-600">
                    <button onClick={() => handleStyleChange('bold', !isBold)} className={`p-1 rounded hover:bg-gray-100 ${isBold ? 'bg-gray-200 text-black' : ''}`}><Bold size={16} /></button>
                    <button onClick={() => handleStyleChange('italic', !isItalic)} className={`p-1 rounded hover:bg-gray-100 ${isItalic ? 'bg-gray-200 text-black' : ''}`}><Italic size={16} /></button>
                </div>

                {/* Alignment */}
                <div className="flex gap-1 text-gray-600">
                    <button onClick={() => handleStyleChange('align', 'left')} className={`p-1 rounded hover:bg-gray-100 ${textAlign === 'left' ? 'bg-gray-200 text-black' : ''}`}><AlignLeft size={16} /></button>
                    <button onClick={() => handleStyleChange('align', 'center')} className={`p-1 rounded hover:bg-gray-100 ${textAlign === 'center' ? 'bg-gray-200 text-black' : ''}`}><AlignCenter size={16} /></button>
                    <button onClick={() => handleStyleChange('align', 'right')} className={`p-1 rounded hover:bg-gray-100 ${textAlign === 'right' ? 'bg-gray-200 text-black' : ''}`}><AlignRight size={16} /></button>
                </div>
            </NodeToolbar>

            {/* Settings Toggle Button (Top Right) */}
            {selected && (
                <div
                    className="absolute -top-3 -right-3 z-50 origin-bottom-left"
                    style={{ transform: `scale(${scale})` }}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                        className="p-1.5 bg-white rounded-full shadow-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                        <Settings size={14} />
                    </button>
                </div>
            )}

            {/* Main Node Content */}
            <div className="relative w-full h-full group">
                {/* Selection/Border Overlay - Separated from shadow to avoid conflict */}
                <div
                    className={`absolute inset-0 rounded-2xl pointer-events-none z-10 ${selected ? 'border-2 border-blue-500' : 'border border-black/10 transition-colors duration-300'
                        }`}
                />

                <div
                    className="w-full h-full rounded-2xl overflow-hidden"
                    style={{
                        backgroundColor: color,
                        boxShadow: shadow,
                    }}
                    onDoubleClick={() => setIsEditing(true)}
                >
                    {/* Smart Handles for all directions */}
                    <SmartHandle nodeId={id} position={Position.Top} isVisible={selected} />
                    <SmartHandle nodeId={id} position={Position.Bottom} isVisible={selected} />
                    <SmartHandle nodeId={id} position={Position.Left} isVisible={selected} />
                    <SmartHandle nodeId={id} position={Position.Right} isVisible={selected} />

                    <div className="p-4 h-full flex flex-col">
                        {isEditing ? (
                            <textarea
                                ref={textareaRef}
                                className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-gray-800 font-medium leading-relaxed outline-none"
                                style={{
                                    fontWeight: isBold ? 'bold' : 'normal',
                                    fontStyle: isItalic ? 'italic' : 'normal',
                                    textAlign: textAlign,
                                }}
                                placeholder="Type here..."
                                value={text}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setText(val);
                                    updateNodeData(id, { text: val });
                                }}
                                onBlur={() => setIsEditing(false)}
                                onKeyDown={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        ) : (
                            <div
                                className="w-full h-full whitespace-pre-wrap text-gray-800 font-medium leading-relaxed"
                                style={{
                                    fontWeight: isBold ? 'bold' : 'normal',
                                    fontStyle: isItalic ? 'italic' : 'normal',
                                    textAlign: textAlign,
                                }}
                            >
                                {text || <span className="text-black/20 italic">Double click to edit</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
