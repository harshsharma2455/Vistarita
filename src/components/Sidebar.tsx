import { useRef, useState } from 'react';
import {
    MousePointer2,
    Hand,
    Square,
    Circle,
    Triangle,
    Hexagon,
    Diamond,
    Type,
    FileText,
    Table,
    Upload,
    Minus,
    ArrowRight,
    CornerDownRight,
    Spline
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
    onAddNode: (type: string, data?: any) => void;
    toolMode: 'select' | 'hand';
    setToolMode: (mode: 'select' | 'hand') => void;
    edgeType: string;
    setEdgeType: (type: string) => void;
}

export function Sidebar({ onAddNode, toolMode, setToolMode, edgeType, setEdgeType }: SidebarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

    const handleDragStart = (event: React.DragEvent, nodeType: string, payload?: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        if (payload) {
            event.dataTransfer.setData('application/reactflow-data', JSON.stringify(payload));
        }
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onAddNode('image', { src: e.target?.result as string, label: file.name });
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            onAddNode('pdf', { file: file, label: file.name });
        } else if (file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onAddNode('table', { csvData: e.target?.result as string, label: file.name });
            };
            reader.readAsText(file);
        }
    };

    const submenuItems: Record<string, any[]> = {
        shapes: [
            { id: 'rect', icon: Square, label: 'Rectangle', type: 'shape', data: { shapeType: 'rectangle' } },
            { id: 'circle', icon: Circle, label: 'Circle', type: 'shape', data: { shapeType: 'circle' } },
            { id: 'triangle', icon: Triangle, label: 'Triangle', type: 'shape', data: { shapeType: 'triangle' } },
            { id: 'diamond', icon: Diamond, label: 'Diamond', type: 'shape', data: { shapeType: 'diamond' } },
            { id: 'hexagon', icon: Hexagon, label: 'Hexagon', type: 'shape', data: { shapeType: 'hexagon' } },
        ],
        lines: [
            { id: 'default', icon: Spline, label: 'Bezier', value: 'default' },
            { id: 'straight', icon: Minus, label: 'Straight', value: 'straight' },
            { id: 'step', icon: CornerDownRight, label: 'Step', value: 'step' },
            { id: 'smoothstep', icon: ArrowRight, label: 'Smooth Step', value: 'smoothstep' },
        ],
    };

    const containerStyle = {
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
        color: 'var(--sidebar-fg)',
    };

    const buttonClass = "p-2 rounded-lg transition-colors relative group border border-transparent hover:border-[var(--sidebar-border)]";
    const activeClass = "!bg-[var(--sidebar-active-bg)] !text-[var(--sidebar-active-fg)] shadow-sm";

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">

            {/* Tool Toggles */}
            <div
                className="backdrop-blur-xl border shadow-lg rounded-xl p-1 flex flex-col gap-1 transition-colors duration-300"
                style={containerStyle}
            >
                <button
                    onClick={() => setToolMode('select')}
                    className={clsx(
                        buttonClass,
                        toolMode === 'select' && activeClass
                    )}
                    title="Select Mode"
                >
                    <MousePointer2 size={20} />
                </button>
                <button
                    onClick={() => setToolMode('hand')}
                    className={clsx(
                        buttonClass,
                        toolMode === 'hand' && activeClass
                    )}
                    title="Pan Mode"
                >
                    <Hand size={20} />
                </button>
            </div>

            {/* Main Tools */}
            <div
                className="backdrop-blur-xl border shadow-2xl rounded-2xl p-2 flex flex-col gap-2 relative transition-colors duration-300"
                style={containerStyle}
            >

                {/* Note */}
                <div
                    className="p-2 hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-active-fg)] rounded-xl cursor-grab transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'note')}
                    onClick={() => onAddNode('note')}
                    title="Sticky Note"
                >
                    <FileText size={20} />
                </div>

                {/* Text */}
                <div
                    className="p-2 hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-active-fg)] rounded-xl cursor-grab transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'note', { text: 'Text', color: 'transparent', shadow: 'none' })}
                    onClick={() => onAddNode('note', { text: 'Text', color: 'transparent', shadow: 'none' })}
                    title="Text"
                >
                    <Type size={20} />
                </div>

                {/* Separator */}
                <div className="h-px bg-[var(--sidebar-border)] mx-2 opacity-50" />

                {/* Submenu Triggers */}

                {/* Shapes */}
                <div
                    className="relative group disabled-cursor"
                    onMouseEnter={() => setActiveSubmenu('shapes')}
                    onMouseLeave={() => setActiveSubmenu(null)}
                >
                    <button className="p-2 hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-active-fg)] rounded-xl w-full transition-colors">
                        <Square size={20} />
                    </button>

                    {/* Shapes Submenu */}
                    {activeSubmenu === 'shapes' && (
                        <div
                            className="absolute left-full top-0 ml-2 backdrop-blur-xl border shadow-xl rounded-xl p-2 grid grid-cols-2 gap-2 min-w-[80px]"
                            style={containerStyle}
                        >
                            {submenuItems.shapes.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-2 hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-active-fg)] rounded-lg cursor-grab flex justify-center transition-colors"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item.type, item.data)}
                                    onClick={() => onAddNode(item.type, item.data)}
                                    title={item.label}
                                >
                                    <item.icon size={18} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lines */}
                <div
                    className="relative group"
                    onMouseEnter={() => setActiveSubmenu('lines')}
                    onMouseLeave={() => setActiveSubmenu(null)}
                >
                    <button
                        className={clsx(
                            "p-2 hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-active-fg)] rounded-xl w-full transition-colors",
                            edgeType !== 'default' && activeClass
                        )}
                    >
                        <ArrowRight size={20} />
                    </button>

                    {/* Lines Submenu */}
                    {activeSubmenu === 'lines' && (
                        <div
                            className="absolute left-full top-0 ml-2 backdrop-blur-xl border shadow-xl rounded-xl p-2 flex flex-col gap-1 min-w-[120px]"
                            style={containerStyle}
                        >
                            {submenuItems.lines.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setEdgeType(item.value)}
                                    className={clsx(
                                        "p-2 text-sm text-left rounded-lg hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-active-fg)] flex items-center gap-2 transition-colors",
                                        edgeType === item.value && activeClass
                                    )}
                                >
                                    <item.icon size={16} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Table */}
                <div
                    className="p-2 hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-active-fg)] rounded-xl cursor-grab transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'table')}
                    onClick={() => onAddNode('table')}
                    title="Table"
                >
                    <Table size={20} />
                </div>

                {/* Separator */}
                <div className="h-px bg-[var(--sidebar-border)] mx-2 opacity-50" />

                {/* Import */}
                <div
                    className="p-2 hover:bg-[var(--sidebar-active-bg)] hover:text-[var(--sidebar-active-fg)] rounded-xl cursor-pointer transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    title="Import"
                >
                    <Upload size={20} />
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.csv"
                />

            </div>
        </div>
    );
}
