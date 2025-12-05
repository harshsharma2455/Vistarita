export interface ElectronAPI {
    saveState: (data: { nodes: any[]; edges: any[] }) => void;
    loadState: () => Promise<{ nodes: any[]; edges: any[] } | null>;
}

declare global {
    interface Window {
        electron?: ElectronAPI;
    }
}
