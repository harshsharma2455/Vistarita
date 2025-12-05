import { memo, useState } from 'react';
import { Position, NodeProps, Node, NodeResizeControl, useViewport } from '@xyflow/react';
import { Settings } from 'lucide-react';
import { SmartHandle } from '../SmartHandle';

type PDFNodeData = {
    file?: File;
    url?: string;
    label?: string;
};

type PDFNode = Node<PDFNodeData, 'pdf'>;

export const PDFNode = memo(({ id, data, selected }: NodeProps<PDFNode>) => {
    const [isHovered, setIsHovered] = useState(false);
    const { zoom } = useViewport();
    const scale = Math.min(2.5, Math.max(1, 1 / zoom));

    const [url] = useState(() => {
        let src = '';
        if (data.file) {
            src = URL.createObjectURL(data.file);
        } else {
            src = data.url || '';
        }
        // Append params to hide toolbar and nav panes
        return src ? `${src}#toolbar=0&navpanes=0&scrollbar=0` : '';
    });

    return (
        <div
            className="relative group w-full h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ minWidth: '200px', minHeight: '300px' }}
        >
            {/* Resize Controls - Visible only when selected */}
            <NodeResizeControl
                variant={"line" as any}
                minWidth={200}
                minHeight={300}
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
                className={`absolute inset-0 rounded-lg pointer-events-none z-10 transition-all duration-200 ${selected ? 'border-2 border-blue-500 shadow-md' : 'border border-gray-200'
                    }`}
            />

            {/* Main Content */}
            <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                {url ? (
                    <embed
                        src={url}
                        type="application/pdf"
                        className="w-full h-full block"
                        style={{ minHeight: '100%' }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm bg-gray-50">
                        No PDF Loaded
                    </div>
                )}
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
                            console.log('PDF Settings clicked');
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
