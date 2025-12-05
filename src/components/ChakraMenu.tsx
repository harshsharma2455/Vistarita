import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Code, Image as ImageIcon, FileText, PenTool, Table } from 'lucide-react';
import { clsx } from 'clsx';

interface ChakraMenuProps {
    onAddNode?: (type: string) => void;
}

export function ChakraMenu({ onAddNode }: ChakraMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuItems = [
        { id: 'note', icon: FileText, label: 'Add Note', color: 'bg-amber-100 text-amber-700' },
        { id: 'code', icon: Code, label: 'Add Code', color: 'bg-blue-100 text-blue-700' },
        { id: 'image', icon: ImageIcon, label: 'Upload Image', color: 'bg-purple-100 text-purple-700' },
        { id: 'table', icon: Table, label: 'Add Table', color: 'bg-green-100 text-green-700' },
        { id: 'draw', icon: PenTool, label: 'Pencil', color: 'bg-rose-100 text-rose-700' },
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
            <AnimatePresence>
                {isOpen && (
                    <>
                        {menuItems.map((item, index) => {
                            // Adjusting for a semi-circle or full circle. Let's do a semi-circle above.
                            // Actually, "blooming lotus" implies expanding outwards.
                            // Let's place them in a semi-circle above the button.
                            const radius = 80;
                            // Wait, let's just do a simple fan out for now.
                            // Let's use specific offsets for 4 items: -135, -90, -45, 0? No.
                            // Let's distribute them evenly from -160 to -20 degrees.

                            const step = 140 / (menuItems.length - 1);
                            const currentAngle = -160 + (index * step);
                            const x = Math.cos((currentAngle * Math.PI) / 180) * radius;
                            const y = Math.sin((currentAngle * Math.PI) / 180) * radius;

                            return (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                    animate={{ opacity: 1, scale: 1, x, y }}
                                    exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 }}
                                    onClick={() => {
                                        onAddNode?.(item.id);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        "absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border border-white/50",
                                        item.color
                                    )}
                                    title={item.label}
                                >
                                    <item.icon size={20} />
                                </motion.button>
                            );
                        })}
                    </>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleMenu}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ rotate: isOpen ? 45 : 0 }}
                className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center shadow-antigravity z-10 border-4 border-white/20 backdrop-blur-sm"
            >
                <Plus size={32} />
            </motion.button>
        </div>
    );
}
