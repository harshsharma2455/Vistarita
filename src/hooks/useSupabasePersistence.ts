import { useEffect, useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { supabase } from '../lib/supabase';

export function useSupabasePersistence(
    nodes: Node[],
    edges: Edge[],
    setNodes: (nodes: Node[]) => void,
    setEdges: (edges: Edge[]) => void
) {
    const [session, setSession] = useState<any>(null);
    const [canvasId, setCanvasId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Check Auth Sessionddfa
    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Load or Create Canvas for User
    useEffect(() => {
        if (!session?.user) return;

        const loadCanvas = async () => {
            try {
                setError(null);
                console.log('Loading canvas for user:', session.user.id);

                // Try to find an existing canvas for this user
                const { data: canvases, error: fetchError } = await supabase
                    .from('canvases')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .limit(1);

                if (fetchError) throw fetchError;

                if (canvases && canvases.length > 0) {
                    console.log('Found existing canvas:', canvases[0].id);
                    const canvas = canvases[0];
                    setCanvasId(canvas.id);
                    if (canvas.content) {
                        setNodes(canvas.content.nodes || []);
                        setEdges(canvas.content.edges || []);
                    }
                } else {
                    console.log('Creating new canvas...');
                    // Create new default canvas
                    const { data: newCanvas, error: createError } = await supabase
                        .from('canvases')
                        .insert([
                            {
                                user_id: session.user.id,
                                title: 'My First Canvas',
                                content: { nodes: [], edges: [] },
                            },
                        ])
                        .select()
                        .single();

                    if (createError) throw createError;
                    console.log('Created new canvas:', newCanvas.id);
                    setCanvasId(newCanvas.id);
                }
            } catch (err: any) {
                console.error('Error loading/creating canvas:', err);
                setError(err.message || 'Failed to load canvas');
            } finally {
                setIsLoaded(true);
            }
        };

        loadCanvas();
    }, [session, setNodes, setEdges]);

    // 3. Auto-Save
    useEffect(() => {
        if (!session?.user || !canvasId || !isLoaded) return;

        const save = setTimeout(async () => {
            try {
                console.log('Auto-saving...');
                const { error: saveError } = await supabase
                    .from('canvases')
                    .update({
                        content: { nodes, edges },
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', canvasId);

                if (saveError) throw saveError;
                console.log('Save successful');
            } catch (err: any) {
                console.error('Error saving canvas:', err);
                setError(err.message || 'Failed to save changes');
            }
        }, 1000); // Debounce 1s

        return () => clearTimeout(save);
    }, [nodes, edges, session, canvasId, isLoaded]);

    return { session, isLoaded, error };
}
