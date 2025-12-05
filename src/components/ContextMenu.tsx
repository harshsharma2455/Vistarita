import { memo } from 'react';
import { Copy, Clipboard, CopyPlus, Trash2 } from 'lucide-react';

type ContextMenuProps = {
    x: number;
    y: number;
    onCopy: () => void;
    onPaste: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onClose: () => void;
    hasSelection: boolean;
};

export const ContextMenu = memo(({ x, y, onCopy, onPaste, onDuplicate, onDelete, onClose, hasSelection }: ContextMenuProps) => {
    return (
        <div
            className="absolute z-50 bg-white/90 backdrop-blur-md border border-white/50 shadow-xl rounded-xl overflow-hidden min-w-[180px] py-1 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: y, left: x }}
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onCopy();
                }}
                disabled={!hasSelection}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Copy size={14} />
                <span>Copy</span>
                <span className="ml-auto text-xs text-gray-400">Ctrl+C</span>
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onPaste();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
            >
                <Clipboard size={14} />
                <span>Paste</span>
                <span className="ml-auto text-xs text-gray-400">Ctrl+V</span>
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                }}
                disabled={!hasSelection}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <CopyPlus size={14} />
                <span>Duplicate</span>
                <span className="ml-auto text-xs text-gray-400">Ctrl+D</span>
            </button>
            <div className="h-px bg-gray-100 my-1" />
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                disabled={!hasSelection}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Trash2 size={14} />
                <span>Delete</span>
                <span className="ml-auto text-xs text-red-300">Del</span>
            </button>
        </div>
    );
});
