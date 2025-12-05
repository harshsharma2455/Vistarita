import { useEffect, useState } from 'react';
import { Node, Edge } from '@xyflow/react';

export function usePersistence(
    nodes: Node[],
    edges: Edge[],
    setNodes: (nodes: Node[]) => void,
    setEdges: (edges: Edge[]) => void
) {
    const [isLoaded, setIsLoaded] = useState(false);

    // Load state on mount
    useEffect(() => {
        const load = async () => {
            if (window.electron) {
                try {
                    const data = await window.electron.loadState();
                    if (data) {
                        setNodes(data.nodes || []);
                        setEdges(data.edges || []);
                    }
                } catch (error) {
                    console.error('Failed to load state:', error);
                }
            }
            setIsLoaded(true);
        };
        load();
    }, [setNodes, setEdges]);

    // Auto-save when nodes or edges change
    useEffect(() => {
        if (!isLoaded) return; // Don't save before loading

        const save = setTimeout(() => {
            if (window.electron) {
                window.electron.saveState({ nodes, edges });
            }
        }, 1000); // Debounce 1s

        return () => clearTimeout(save);
    }, [nodes, edges, isLoaded]);

    return { isLoaded };
}
