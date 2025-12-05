import { memo, useState } from 'react';
import { Position, NodeProps, Node, NodeResizeControl, useViewport } from '@xyflow/react';
import { Settings } from 'lucide-react';
import { SmartHandle } from '../SmartHandle';

type TableNodeData = {
    headers: string[];
    rows: string[][];
    label?: string;
};

type TableNode = Node<TableNodeData, 'table'>;

export const TableNode = memo(({ id, data, selected }: NodeProps<TableNode>) => {
    const [isHovered, setIsHovered] = useState(false);
    const { zoom } = useViewport();
    const scale = Math.min(2.5, Math.max(1, 1 / zoom));

    return (
        <div
            className="relative group w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ minWidth: '300px', minHeight: '200px' }}
        >
            {/* Resize Controls - Visible only when selected */}
            <NodeResizeControl
                variant={"line" as any}
                minWidth={300}
                minHeight={200}
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

            {/* Header / Label */}
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                <span>{data.label || 'Table Data'}</span>
                <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                    {data.rows?.length || 0} rows
                </span>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-white">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-0">
                        <tr>
                            {data.headers?.map((header, i) => (
                                <th key={i} scope="col" className="px-4 py-2 border-b border-gray-100 whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows?.map((row, i) => (
                            <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                {row.map((cell, j) => (
                                    <td key={j} className="px-4 py-2 border-b border-gray-50 whitespace-nowrap">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {(!data.rows || data.rows.length === 0) && (
                            <tr>
                                <td colSpan={data.headers?.length || 1} className="px-4 py-8 text-center text-gray-400 italic">
                                    No data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
                            console.log('Table Settings clicked');
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
