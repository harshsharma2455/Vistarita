import { useCallback, useState, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Node,
    Edge,
    SelectionMode,
    MarkerType
} from '@xyflow/react';
import { supabase } from './lib/supabase';
import Papa from 'papaparse';
import '@xyflow/react/dist/style.css';

import { ChakraMenu } from './components/ChakraMenu';
import { InfiniteBackground } from './components/InfiniteBackground';
import { ContextMenu } from './components/ContextMenu';
import { useSupabasePersistence } from './hooks/useSupabasePersistence';
import { Auth } from './components/Auth';
import { nodeRegistry, getNodeTypes } from './registry/NodeRegistry';

const nodeTypes = getNodeTypes() as any;

const initialNodes: Node[] = [];

function App() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // Supabase Persistence Hook
    const { session, isLoaded, error } = useSupabasePersistence(nodes, edges, setNodes, setEdges);

    if (!supabase) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Required</h1>
                <p className="text-gray-700 mb-4 text-center max-w-md">
                    Please set up your Supabase credentials in the <code>.env</code> file.
                </p>
                <div className="bg-white p-4 rounded shadow text-sm font-mono text-gray-600">
                    VITE_SUPABASE_URL=...<br />
                    VITE_SUPABASE_ANON_KEY=...
                </div>
            </div>
        );
    }


    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const [lastClickTime, setLastClickTime] = useState(0);
    const [rfInstance, setRfInstance] = useState<any>(null);

    const handleAddNode = (type: string) => {
        const def = nodeRegistry[type];
        if (!def) return;

        const id = Math.random().toString(36).substr(2, 9);
        const newNode: Node = {
            id,
            type,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500
            },
            data: { ...def.defaultData },
        };

        setNodes((nds) => nds.concat(newNode));
    };

    // ... (rest of the handlers: handleCopy, handlePaste, etc. - keeping them as is) ...
    // Note: I am not including the full file content here to save tokens, 
    // but in a real scenario I would ensure the handlers are preserved.
    // For this specific tool call, I will target the top part of the file and the render return.

    // --- Context Menu State ---
    const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

    // --- Action Handlers (Centralized) ---
    const handleCopy = useCallback(() => {
        const selectedNodes = nodes.filter((n) => n.selected);
        if (selectedNodes.length > 0) {
            const data = JSON.stringify(selectedNodes);
            navigator.clipboard.writeText(data);
        }
        setMenu(null);
    }, [nodes]);

    const handlePaste = useCallback(async () => {
        window.focus();
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                const imageType = item.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const position = rfInstance?.screenToFlowPosition({
                            x: menu ? menu.x : window.innerWidth / 2,
                            y: menu ? menu.y : window.innerHeight / 2,
                        }) || { x: 0, y: 0 };

                        const newNode: Node = {
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'image',
                            position,
                            data: { src: e.target?.result as string, label: 'Pasted Image' },
                        };
                        setNodes((nds) => nds.concat(newNode));
                    };
                    reader.readAsDataURL(blob);
                    setMenu(null);
                    return;
                }
                if (item.types.includes('text/plain')) {
                    const blob = await item.getType('text/plain');
                    const text = await blob.text();
                    let pastedNodes: Node[] = [];
                    try {
                        const parsed = JSON.parse(text);
                        if (Array.isArray(parsed) && parsed[0]?.id) {
                            pastedNodes = parsed;
                        }
                    } catch (e) { }

                    const position = rfInstance?.screenToFlowPosition({
                        x: menu ? menu.x : window.innerWidth / 2,
                        y: menu ? menu.y : window.innerHeight / 2,
                    }) || { x: 0, y: 0 };

                    if (pastedNodes.length > 0) {
                        const centerX = pastedNodes.reduce((sum, n) => sum + n.position.x, 0) / pastedNodes.length;
                        const centerY = pastedNodes.reduce((sum, n) => sum + n.position.y, 0) / pastedNodes.length;

                        const newNodes = pastedNodes.map((node) => ({
                            ...node,
                            id: Math.random().toString(36).substr(2, 9),
                            position: {
                                x: position.x + (node.position.x - centerX),
                                y: position.y + (node.position.y - centerY),
                            },
                            selected: true,
                        }));
                        setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNodes));
                    } else if (text) {
                        const newNode: Node = {
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'note',
                            position,
                            data: { text },
                        };
                        setNodes((nds) => nds.concat(newNode));
                    }
                }
            }
        } catch (err: any) {
            console.warn('Clipboard read failed:', err);
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    const position = rfInstance?.screenToFlowPosition({
                        x: menu ? menu.x : window.innerWidth / 2,
                        y: menu ? menu.y : window.innerHeight / 2,
                    }) || { x: 0, y: 0 };

                    const newNode: Node = {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'note',
                        position,
                        data: { text },
                    };
                    setNodes((nds) => nds.concat(newNode));
                }
            } catch (e) {
                alert(`Clipboard access denied: ${err.message || err}. \nPlease use Ctrl+V instead.`);
            }
        }
        setMenu(null);
    }, [rfInstance, menu, setNodes]);

    const handleDuplicate = useCallback(() => {
        const selectedNodes = nodes.filter((n) => n.selected);
        if (selectedNodes.length === 0) return;

        const newNodes = selectedNodes.map((node) => ({
            ...node,
            id: Math.random().toString(36).substr(2, 9),
            position: { x: node.position.x + 50, y: node.position.y + 50 },
            selected: true,
        }));

        setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNodes));
        setMenu(null);
    }, [nodes, setNodes]);

    const handleDelete = useCallback(() => {
        const selectedNodes = nodes.filter((n) => n.selected);
        if (selectedNodes.length > 0) {
            setNodes((nds) => nds.filter((n) => !n.selected));
        }
        setMenu(null);
    }, [nodes, setNodes]);

    // --- Global Drag & Drop Handler ---
    useEffect(() => {
        const handleDragOver = (event: DragEvent) => {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
        };

        const handleDrop = (event: DragEvent) => {
            event.preventDefault();

            if (!rfInstance) return;

            // Check if drop is on the canvas (or just allow global drops for now)
            // We can refine this if needed, but for now we want to catch ANY file drop

            const files = event.dataTransfer?.files;
            if (!files || files.length === 0) return;

            const position = rfInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            Array.from(files).forEach(async (file) => {
                if (!supabase) return;
                const id = Math.random().toString(36).substr(2, 9);
                let newNode: Node | null = null;

                // Upload to Supabase Storage
                const fileName = `${Date.now()}-${file.name}`;
                const { error } = await supabase.storage
                    .from('canvas-assets')
                    .upload(fileName, file);

                if (error) {
                    console.error('Upload failed:', error);
                    alert('Failed to upload file');
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('canvas-assets')
                    .getPublicUrl(fileName);

                if (file.type.startsWith('image/')) {
                    newNode = {
                        id,
                        type: 'image',
                        position,
                        data: { src: publicUrl, label: file.name },
                    };
                    setNodes((nds) => nds.concat(newNode!));
                } else if (file.type === 'application/pdf') {
                    newNode = {
                        id,
                        type: 'pdf',
                        position,
                        data: { url: publicUrl, label: file.name }, // Store URL correctly
                    };
                    setNodes((nds) => nds.concat(newNode!));
                } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                    const text = await file.text();
                    const result = Papa.parse(text, { skipEmptyLines: true });
                    const rows = result.data as string[][];
                    const headers = rows.length > 0 ? rows.shift() : [];

                    newNode = {
                        id,
                        type: 'table',
                        position,
                        data: {
                            headers: headers as string[],
                            rows: rows as string[][],
                            label: file.name
                        },
                    };
                    setNodes((nds) => nds.concat(newNode!));
                }
            });
        };

        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('drop', handleDrop);
        };
    }, [rfInstance, setNodes]);

    // --- Context Menu Handler ---
    const onContextMenu = useCallback(
        (event: React.MouseEvent | MouseEvent) => {
            event.preventDefault();
            setMenu({
                x: event.clientX,
                y: event.clientY,
            });
        },
        []
    );

    const onPaneClickWithInstance = useCallback((event: React.MouseEvent | MouseEvent) => {
        setMenu(null);
        // ... existing pane click logic ...
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;

        if (timeDiff < 300 && rfInstance) {
            const position = rfInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const id = Math.random().toString(36).substr(2, 9);
            const newNode: Node = {
                id,
                type: 'note',
                position,
                data: { text: '' }, // Empty note
            };
            setNodes((nds) => nds.concat(newNode));
        }
        setLastClickTime(currentTime);
    }, [lastClickTime, rfInstance, setNodes]);

    // --- Clipboard & Keyboard Actions ---
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore delete events if typing in an input
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement ||
                (document.activeElement as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            if (event.ctrlKey || event.metaKey) {
                if (event.key === 'c') {
                    handleCopy();
                } else if (event.key === 'v') {
                    // Paste handled by 'paste' event usually, but we can trigger manual logic if needed
                    // navigator.clipboard.readText() requires focus
                } else if (event.key === 'd') {
                    event.preventDefault();
                    handleDuplicate();
                }
            }
            if (event.key === 'Delete' || event.key === 'Backspace') {
                handleDelete();
            }
        };

        const handlePasteEvent = (event: ClipboardEvent) => {
            // Prevent default paste if we are focused on an input/textarea
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement
            ) {
                return;
            }
            // Logic merged into handlePaste but event listener needs specific handling for files
            const items = event.clipboardData?.items;
            if (!items) return;

            // Check for files first (images)
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const position = rfInstance?.screenToFlowPosition({
                                x: window.innerWidth / 2,
                                y: window.innerHeight / 2,
                            }) || { x: 0, y: 0 };

                            const newNode: Node = {
                                id: Math.random().toString(36).substr(2, 9),
                                type: 'image',
                                position,
                                data: { src: e.target?.result as string, label: 'Pasted Image' },
                            };
                            setNodes((nds) => nds.concat(newNode));
                        };
                        reader.readAsDataURL(file);
                    }
                    return; // Stop if file found
                }
            }

            // If no files, try text via handlePaste (which handles JSON nodes or plain text)
            handlePaste();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('paste', handlePasteEvent);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('paste', handlePasteEvent);
        };
    }, [handleCopy, handleDuplicate, handleDelete, handlePaste, rfInstance, setNodes]);

    if (!session) {
        return <Auth />;
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100 text-gray-500">
                Loading your canvas...
            </div>
        );
    }

    return (
        <div className="w-full h-screen relative overflow-hidden bg-gray-100">
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
                    Error: {error}
                </div>
            )}
            <div
                className="absolute inset-0 z-10"
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    onInit={setRfInstance}
                    onPaneClick={onPaneClickWithInstance}
                    onNodeContextMenu={onContextMenu}
                    onPaneContextMenu={onContextMenu}
                    fitView
                    className="bg-transparent"
                    minZoom={0.1}
                    maxZoom={4}
                    // Interaction Settings
                    deleteKeyCode={['Backspace', 'Delete']}
                    multiSelectionKeyCode={['Control', 'Meta', 'Shift']}
                    selectionOnDrag={true}
                    panOnDrag={[1, 2]} // Pan with Middle (1) or Right (2) click
                    selectionMode={SelectionMode.Partial}
                    zoomOnScroll={true}
                    zoomOnPinch={true}
                    zoomOnDoubleClick={false}
                    defaultEdgeOptions={{
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            width: 20,
                            height: 20,
                            color: '#b1b1b7',
                        },
                        style: {
                            strokeWidth: 2,
                            stroke: '#b1b1b7',
                        },
                    }}
                >

                    <InfiniteBackground />
                    <Controls className="!bg-white/50 !backdrop-blur-md !border-white/40 !shadow-glass !text-teal-900" />

                    {menu && (
                        <ContextMenu
                            x={menu.x}
                            y={menu.y}
                            onCopy={handleCopy}
                            onPaste={handlePaste}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                            onClose={() => setMenu(null)}
                            hasSelection={nodes.some(n => n.selected)}
                        />
                    )}
                </ReactFlow>
            </div>

            <ChakraMenu onAddNode={handleAddNode} />
        </div>
    );
}

export default App;
