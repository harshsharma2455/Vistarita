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

import { Sidebar } from './components/Sidebar';
import { InfiniteBackground } from './components/InfiniteBackground';
import { ContextMenu } from './components/ContextMenu';
import { useSupabasePersistence } from './hooks/useSupabasePersistence';
import { Auth } from './components/Auth';
import { nodeRegistry, getNodeTypes } from './registry/NodeRegistry';

import { getTheme } from './registry/ThemeRegistry';
import { SettingsPage } from './components/SettingsPage';
import { Settings as SettingsIcon } from 'lucide-react';

const nodeTypes = getNodeTypes() as any;

const initialNodes: Node[] = [];

function App() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // Persistence hook moved below state declarations

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

    const handleAddNode = (type: string, data?: any) => {
        const def = nodeRegistry[type];
        if (!def) return;

        // Specialized handling for shapes or imports
        const initialData = data ? { ...def.defaultData, ...data } : { ...def.defaultData };

        const id = Math.random().toString(36).substr(2, 9);
        const newNode: Node = {
            id,
            type,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500
            },
            data: initialData,
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

    // --- Drag & Drop Handler ---
    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();

        if (!rfInstance) return;

        const type = event.dataTransfer.getData('application/reactflow');
        const dataString = event.dataTransfer.getData('application/reactflow-data');

        const position = rfInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        const id = Math.random().toString(36).substr(2, 9);

        // Handle Sidebar Node Drops
        if (type) {
            const data = dataString ? JSON.parse(dataString) : {};
            const def = nodeRegistry[type];
            // Merge default data with payload
            const finalData = def ? { ...def.defaultData, ...data } : data;

            const newNode: Node = {
                id,
                type,
                position,
                data: finalData,
            };

            setNodes((nds) => nds.concat(newNode));
            return;
        }

        // Handle File Drops (Native)
        const files = event.dataTransfer.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach(async (file) => {
            if (!supabase) return;
            const fileId = Math.random().toString(36).substr(2, 9);
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
                    id: fileId,
                    type: 'image',
                    position,
                    data: { src: publicUrl, label: file.name },
                };
                setNodes((nds) => nds.concat(newNode!));
            } else if (file.type === 'application/pdf') {
                newNode = {
                    id: fileId,
                    type: 'pdf',
                    position,
                    data: { url: publicUrl, label: file.name },
                };
                setNodes((nds) => nds.concat(newNode!));
            } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                const text = await file.text();
                const result = Papa.parse(text, { skipEmptyLines: true });
                const rows = result.data as string[][];
                const headers = rows.length > 0 ? rows.shift() : [];

                newNode = {
                    id: fileId,
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

    const [toolMode, setToolMode] = useState<'select' | 'hand'>('select');
    const [edgeType, setEdgeType] = useState('default'); // 'default' (bezier), 'straight', 'step', 'smoothstep'

    // ... imports

    // ... inside App component
    // Theme State
    // Theme State
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [showGrid, setShowGrid] = useState(() => localStorage.getItem('showGrid') !== 'false');
    const [snapToGrid, setSnapToGrid] = useState(() => localStorage.getItem('snapToGrid') !== 'false');
    const [gridType, setGridType] = useState<'dots' | 'lines'>(() => (localStorage.getItem('gridType') as 'dots' | 'lines') || 'dots');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Supabase Persistence Hook (Must be after state declarations)
    const { session, isLoaded, error } = useSupabasePersistence(
        nodes, edges, setNodes, setEdges,
        theme, setTheme,
        gridType, setGridType,
        showGrid, setShowGrid,
        snapToGrid, setSnapToGrid
    );

    useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
    useEffect(() => { localStorage.setItem('showGrid', String(showGrid)); }, [showGrid]);
    useEffect(() => { localStorage.setItem('snapToGrid', String(snapToGrid)); }, [snapToGrid]);
    useEffect(() => { localStorage.setItem('gridType', gridType); }, [gridType]);
    const activeTheme = getTheme(theme);

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

    // Create CSS variables object
    const themeStyles = {
        '--bg-color': activeTheme.colors.background,
        '--text-color': activeTheme.colors.foreground,
        '--text-muted': activeTheme.colors.muted,
        '--primary-color': activeTheme.colors.primary,
        '--primary-fg': activeTheme.colors.primaryForeground,
        '--border-color': activeTheme.colors.border,
        '--ring-color': activeTheme.colors.ring,

        '--sidebar-bg': activeTheme.sidebar.background,
        '--sidebar-fg': activeTheme.sidebar.foreground,
        '--sidebar-border': activeTheme.sidebar.border,
        '--sidebar-active-bg': activeTheme.sidebar.activeBackground,
        '--sidebar-active-fg': activeTheme.sidebar.activeForeground,

        '--node-note-bg': activeTheme.node.noteBg,
        '--node-shape-bg': activeTheme.node.shapeBg,
        '--node-border': activeTheme.node.border,
        '--node-text': activeTheme.node.text,
        '--node-shadow': activeTheme.node.shadow,
    } as React.CSSProperties;

    return (
        <div
            className="w-full h-screen relative overflow-hidden transition-colors duration-300"
            style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                ...themeStyles
            }}
        >
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
                    Error: {error}
                </div>
            )}

            {/* Settings Page Overlay */}
            <SettingsPage
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                theme={theme} setTheme={setTheme}
                showGrid={showGrid} setShowGrid={setShowGrid}
                snapToGrid={snapToGrid} setSnapToGrid={setSnapToGrid}
                gridType={gridType} setGridType={setGridType}
            />

            {/* Settings Toggle Button (Bottom Left) */}
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="fixed bottom-4 left-4 z-40 p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 border backdrop-blur-md bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] border-[var(--sidebar-border)] hover:brightness-110"
                title="Settings"
            >
                <SettingsIcon size={24} />
            </button>

            {/* Sidebar */}
            <Sidebar
                onAddNode={handleAddNode}
                toolMode={toolMode}
                setToolMode={setToolMode}
                edgeType={edgeType as any}
                setEdgeType={setEdgeType}
            />

            <div className="absolute inset-0 z-0">
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
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    fitView
                    minZoom={0.1}
                    maxZoom={4}
                    snapToGrid={snapToGrid}
                    snapGrid={[20, 20]}
                    // Interaction Settings
                    panOnDrag={toolMode === 'hand' || [1, 2]} // Pan with Hand tool OR Middle/Right click
                    selectionOnDrag={toolMode === 'select'}   // Select box only in Select mode
                    selectionMode={SelectionMode.Partial}
                    defaultEdgeOptions={{
                        type: edgeType,
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#b1b1b7' },
                        style: { strokeWidth: 2, stroke: '#b1b1b7' },
                    }}
                    proOptions={{ hideAttribution: true }}
                >
                    <InfiniteBackground
                        color={activeTheme.canvas.dotColor}
                        showGrid={showGrid}
                        variant={gridType}
                    />
                    <Controls position="bottom-right" className="!m-4 !bg-white/90 !backdrop-blur-md !border-white/50 !shadow-xl !rounded-xl overflow-hidden" />
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
        </div>
    );
}

export default App;
