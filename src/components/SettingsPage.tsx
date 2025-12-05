import { useState } from 'react';
import { Settings, X, Monitor, Grid as GridIcon, Layout, Check, Palette } from 'lucide-react';
import { clsx } from 'clsx';
import { themeRegistry } from '../registry/ThemeRegistry';

interface SettingsPageProps {
    isOpen: boolean;
    onClose: () => void;

    // Theme Props
    theme: string;
    setTheme: (theme: string) => void;

    // Grid Props
    showGrid: boolean;
    setShowGrid: (show: boolean) => void;
    snapToGrid: boolean;
    setSnapToGrid: (snap: boolean) => void;
    gridType: 'dots' | 'lines';
    setGridType: (type: 'dots' | 'lines') => void;
}

export function SettingsPage({
    isOpen, onClose,
    theme, setTheme,
    showGrid, setShowGrid,
    snapToGrid, setSnapToGrid,
    gridType, setGridType
}: SettingsPageProps) {
    const [activeTab, setActiveTab] = useState<'appearance' | 'grid'>('appearance');

    if (!isOpen) return null;

    const themes = Object.values(themeRegistry);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] w-[900px] h-[600px] rounded-2xl shadow-2xl flex overflow-hidden text-[var(--sidebar-fg)]">

                {/* Sidebar */}
                <div className="w-64 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]/50 p-4 flex flex-col gap-2">
                    <h2 className="text-xl font-bold px-4 py-4 mb-2 flex items-center gap-2">
                        <Settings className="w-6 h-6" />
                        Settings
                    </h2>

                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'appearance'
                                ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-fg)] shadow-sm"
                                : "hover:bg-[var(--sidebar-active-bg)]/50 hover:text-[var(--sidebar-active-fg)]"
                        )}
                    >
                        <Palette size={18} />
                        Appearance
                    </button>

                    <button
                        onClick={() => setActiveTab('grid')}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'grid'
                                ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-fg)] shadow-sm"
                                : "hover:bg-[var(--sidebar-active-bg)]/50 hover:text-[var(--sidebar-active-fg)]"
                        )}
                    >
                        <GridIcon size={18} />
                        Grid & Snapping
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col relative bg-[var(--bg-color)]/20">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex-1 overflow-y-auto p-8">

                        {/* Appearance Tab */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
                                <div>
                                    <h3 className="text-2xl font-semibold mb-1">Theme</h3>
                                    <p className="text-sm opacity-60 mb-6">Choose how your canvas looks and feels.</p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {themes.map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTheme(t.id)}
                                                className={clsx(
                                                    "group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-lg",
                                                    theme === t.id
                                                        ? "border-[var(--ring-color)] ring-2 ring-[var(--ring-color)]/20 shadow-md"
                                                        : "border-[var(--sidebar-border)] hover:border-[var(--ring-color)]/50"
                                                )}
                                            >
                                                {/* Preview Header */}
                                                <div
                                                    className="h-24 w-full relative"
                                                    style={{ backgroundColor: t.colors.background }}
                                                >
                                                    {/* Fake Nodes Preview */}
                                                    <div
                                                        className="absolute top-4 left-4 w-16 h-12 rounded-lg border shadow-sm"
                                                        style={{
                                                            backgroundColor: t.node.noteBg,
                                                            borderColor: t.node.border
                                                        }}
                                                    />
                                                    <div
                                                        className="absolute top-8 right-8 w-10 h-10 rounded-full border shadow-sm"
                                                        style={{
                                                            backgroundColor: t.node.shapeBg,
                                                            borderColor: t.node.border
                                                        }}
                                                    />
                                                </div>

                                                {/* Label */}
                                                <div
                                                    className="p-3 bg-[var(--sidebar-bg)] border-t border-[var(--sidebar-border)] flex items-center justify-between"
                                                >
                                                    <span className="text-sm font-medium">{t.label}</span>
                                                    {theme === t.id && (
                                                        <div className="bg-[var(--primary-color)] text-[var(--primary-fg)] rounded-full p-1">
                                                            <Check size={12} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grid Tab */}
                        {activeTab === 'grid' && (
                            <div className="space-y-8 animate-in slide-in-from-right-5 duration-300">
                                <div>
                                    <h3 className="text-2xl font-semibold mb-1">Grid System</h3>
                                    <p className="text-sm opacity-60 mb-6">Customize your spatial reference guides.</p>

                                    <div className="grid gap-6 max-w-2xl">

                                        {/* Toggle Grid */}
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-[var(--sidebar-active-bg)]/20 text-[var(--primary-color)]">
                                                    <Layout size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">Show Grid</div>
                                                    <div className="text-xs opacity-60">Display the background grid pattern</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowGrid(!showGrid)}
                                                className={clsx(
                                                    "w-12 h-7 rounded-full p-1 transition-colors duration-200",
                                                    showGrid ? "bg-[var(--primary-color)]" : "bg-[var(--sidebar-border)]"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                                                    showGrid ? "translate-x-5" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>

                                        {/* Grid Type */}
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-[var(--sidebar-active-bg)]/20 text-[var(--primary-color)]">
                                                    <GridIcon size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">Grid Style</div>
                                                    <div className="text-xs opacity-60">Choose between dots or lines</div>
                                                </div>
                                            </div>
                                            <div className="flex bg-[var(--sidebar-active-bg)]/10 p-1 rounded-lg border border-[var(--sidebar-border)]">
                                                <button
                                                    onClick={() => setGridType('dots')}
                                                    className={clsx(
                                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                                        gridType === 'dots'
                                                            ? "bg-[var(--primary-color)] text-[var(--primary-fg)] shadow-sm"
                                                            : "text-[var(--sidebar-fg)]/60 hover:text-[var(--sidebar-fg)]"
                                                    )}
                                                >
                                                    Dots
                                                </button>
                                                <button
                                                    onClick={() => setGridType('lines')}
                                                    className={clsx(
                                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                                        gridType === 'lines'
                                                            ? "bg-[var(--primary-color)] text-[var(--primary-fg)] shadow-sm"
                                                            : "text-[var(--sidebar-fg)]/60 hover:text-[var(--sidebar-fg)]"
                                                    )}
                                                >
                                                    Lines
                                                </button>
                                            </div>
                                        </div>

                                        {/* Snap */}
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-[var(--sidebar-active-bg)]/20 text-[var(--primary-color)]">
                                                    <Monitor size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">Snap to Grid</div>
                                                    <div className="text-xs opacity-60">Align items automatically when dragging</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSnapToGrid(!snapToGrid)}
                                                className={clsx(
                                                    "w-12 h-7 rounded-full p-1 transition-colors duration-200",
                                                    snapToGrid ? "bg-[var(--primary-color)]" : "bg-[var(--sidebar-border)]"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                                                    snapToGrid ? "translate-x-5" : "translate-x-0"
                                                )} />
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
