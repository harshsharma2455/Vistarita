import React, { useCallback } from 'react';
import { Handle, Position, useReactFlow, Node, useViewport } from '@xyflow/react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

type SmartHandleProps = {
    nodeId: string;
    position: Position;
    isVisible: boolean;
};

export const SmartHandle = ({ nodeId, position, isVisible }: SmartHandleProps) => {
    const { getNode, addNodes, addEdges } = useReactFlow();
    const { zoom } = useViewport();

    // Calculate scale inversely to zoom, clamped between 1 and 2.5
    const scale = Math.min(2.5, Math.max(1, 1 / zoom));

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent node selection toggle

        const currentNode = getNode(nodeId);
        if (!currentNode) return;

        const offset = 300;
        let newPos = { ...currentNode.position };
        let targetHandleId = '';
        let sourceHandleId = `source-${position}`;

        // Calculate new position and target handle based on direction
        switch (position) {
            case Position.Top:
                newPos.y -= offset;
                targetHandleId = 'target-bottom';
                break;
            case Position.Bottom:
                newPos.y += offset;
                targetHandleId = 'target-top';
                break;
            case Position.Left:
                newPos.x -= offset;
                targetHandleId = 'target-right';
                break;
            case Position.Right:
                newPos.x += offset;
                targetHandleId = 'target-left';
                break;
        }

        const newNodeId = Math.random().toString(36).substr(2, 9);

        // Clone node data but give new ID and position
        const newNode: Node = {
            ...currentNode,
            id: newNodeId,
            position: newPos,
            selected: false, // Don't select the new node immediately (or maybe do?)
            data: { ...currentNode.data }, // Shallow copy data
        };

        // If it's a NoteNode, we might want to clear text or keep it? 
        // User said "copies the exact block", so we keep text.

        addNodes(newNode);
        addEdges({
            id: `e-${nodeId}-${newNodeId}`,
            source: nodeId,
            target: newNodeId,
            sourceHandle: sourceHandleId,
            targetHandle: targetHandleId,
            type: 'default',
        });

    }, [nodeId, position, getNode, addNodes, addEdges]);

    // Icon selection
    const Icon = {
        [Position.Top]: ArrowUp,
        [Position.Bottom]: ArrowDown,
        [Position.Left]: ArrowLeft,
        [Position.Right]: ArrowRight,
    }[position];

    // Positioning styles for the handle container
    const positionClasses = {
        [Position.Top]: "-top-2.5 left-1/2 -translate-x-1/2",
        [Position.Bottom]: "-bottom-2.5 left-1/2 -translate-x-1/2",
        [Position.Left]: "-left-2.5 top-1/2 -translate-y-1/2",
        [Position.Right]: "-right-2.5 top-1/2 -translate-y-1/2",
    }[position];

    return (
        <>
            {/* Visible Source Handle (for dragging OUT and Clicking) */}
            <div
                className={`absolute ${positionClasses} z-50 transition-all duration-200 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                style={{ transform: `translate(${position === Position.Left || position === Position.Right ? '0, -50%' : '-50%, 0'}) scale(${scale})` }}
            >
                <Handle
                    id={`source-${position}`}
                    type="source"
                    position={position}
                    onClick={handleClick}
                    className="!w-5 !h-5 !bg-white !border !border-gray-200 !rounded-full !flex !items-center !justify-center hover:!bg-blue-50 hover:!border-blue-300 transition-colors cursor-pointer"
                >
                    <Icon size={10} className="text-gray-400 pointer-events-none" />
                </Handle>
            </div>

            {/* Hidden Target Handle (for dragging INTO) - Always active but invisible */}
            <Handle
                id={`target-${position}`}
                type="target"
                position={position}
                className="!w-3 !h-3 !opacity-0"
            />
        </>
    );
};
