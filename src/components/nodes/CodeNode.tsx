import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { GlassCard } from '../GlassCard';

type CodeNode = Node<{
    code?: string;
    language?: string;
    filename?: string;
}, 'code'>;

export function CodeNode({ data }: NodeProps<CodeNode>) {
    return (
        <GlassCard className="min-w-[300px] !p-0 !overflow-hidden">
            <Handle type="target" position={Position.Top} className="!bg-teal-500 !w-3 !h-3" />

            {/* Mac-style Header */}
            <div className="h-8 bg-white/10 border-b border-white/10 flex items-center px-3 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                <span className="ml-2 text-xs text-white/50 font-mono">{data.filename || 'snippet.ts'}</span>
            </div>

            <div className="p-0 text-xs">
                <SyntaxHighlighter
                    language={data.language || 'typescript'}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, borderRadius: 0, background: 'rgba(0,0,0,0.6)' }}
                >
                    {String(data.code || '// No code provided')}
                </SyntaxHighlighter>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !w-3 !h-3" />
        </GlassCard>
    );
}
