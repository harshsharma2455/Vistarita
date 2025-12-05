import { memo, useState } from 'react';
import { Position, NodeProps, Node, NodeResizeControl, useViewport } from '@xyflow/react';
import { Settings } from 'lucide-react';
import { SmartHandle } from '../SmartHandle';

type ImageNodeData = {
    src: string;
    label?: string;
};

type ImageNode = Node<ImageNodeData, 'image'>;

export const ImageNode = memo(({ id, data, selected }: NodeProps<ImageNode>) => {
    const [isHovered, setIsHovered] = useState(false);
    const { zoom } = useViewport();
    const scale = Math.min(2.5, Math.max(1, 1 / zoom));

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ minWidth: '100px', minHeight: '100px', width: '100%', height: '100%' }}
        >
            {/* Resize Controls - Visible only when selected */}
            <NodeResizeControl
                variant={"line" as any}
                minWidth={100}
                minHeight={100}
                className="!opacity-0" // Invisible but interactive
            />

            {/* Corner Resize Handles - Visible when selected */}
            {selected && (
                <>
                    <NodeResizeControl variant={"handle" as any} className="!w-3 !h-3 !bg-blue-500 !border-white !rounded-full !absolute !-top-1.5 !-left-1.5 cursor-nwse-resize" style={{ position: 'absolute', top: -6, left: -6 }} />
                    <NodeResizeControl variant={"handle" as any} className="!w-3 !h-3 !bg-blue-500 !border-white !rounded-full !absolute !-top-1.5 !-right-1.5 cursor-nesw-resize" style={{ position: 'absolute', top: -6, right: -6 }} />
                    <NodeResizeControl variant={"handle" as any} className="!w-3 !h-3 !bg-blue-500 !border-white !rounded-full !absolute !-bottom-1.5 !-left-1.5 cursor-nesw-resize" style={{ position: 'absolute', bottom: -6, left: -6 }} />
                    <NodeResizeControl variant={"handle" as any} className="!w-3 !h-3 !bg-blue-500 !border-white !rounded-full !absolute !-bottom-1.5 !-right-1.5 cursor-nwse-resize" style={{ position: 'absolute', bottom: -6, right: -6 }} />
                </>
            )}

            {/* Selection Border */}
            <div
                className={`absolute inset-0 rounded-lg pointer-events-none z-10 transition-all duration-200 ${selected ? 'border-2 border-blue-500 shadow-md' : 'border border-transparent'
                    }`}
            />

            {/* Main Image Content */}
            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                <img
                    src={data.src}
                    alt={data.label || 'Node Image'}
                    className="w-full h-full object-cover block"
                    draggable={false} // Prevent native drag to allow node dragging
                />
            </div>

            {/* Settings Icon - Visible on Hover or Selection */}
            {(selected || isHovered) && (
                <div
                    className="absolute -top-3 -right-3 z-20 origin-bottom-left"
                    style={{ transform: `scale(${scale})` }}
                >
                    <button
                        className="p-1.5 bg-white rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Placeholder for settings action
                            console.log('Settings clicked');
                        }}
                    >
                        <Settings size={14} />
                    </button>
                </div>
            )}

            {/* Smart Handles for all directions */}
            <SmartHandle nodeId={id} position={Position.Top} isVisible={selected} />
            <SmartHandle nodeId={id} position={Position.Bottom} isVisible={selected} />
            <SmartHandle nodeId={id} position={Position.Left} isVisible={selected} />
            <SmartHandle nodeId={id} position={Position.Right} isVisible={selected} />
        </div>
    );
});
