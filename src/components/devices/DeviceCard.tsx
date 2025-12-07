import React from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useApp } from '@/context';

interface DeviceCardProps {
    children: React.ReactNode;
    title: string;
    icon: React.ReactNode;
    isActive?: boolean;
    color?: string;
    deviceId?: string;
    roomId?: string;
    className?: string;
}

export default function DeviceCard({
    children,
    title,
    icon,
    isActive = false,
    color = '#00d4ff',
    deviceId,
    roomId,
    className = '',
}: DeviceCardProps) {
    const { editMode, removeDeviceFromRoom } = useApp();

    const handleRemove = () => {
        if (deviceId && roomId) {
            removeDeviceFromRoom(roomId, deviceId);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={`relative glass-card p-5 ${className}`}
            style={{
                boxShadow: isActive ? `0 0 30px ${color}30` : undefined,
            }}
        >
            {/* Edit mode remove button */}
            {editMode && deviceId && roomId && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center z-10 hover:bg-red-600 transition-colors"
                    onClick={handleRemove}
                >
                    <FiX size={14} />
                </motion.button>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: isActive ? `linear-gradient(135deg, ${color}40, ${color}20)` : 'rgba(255, 255, 255, 0.05)',
                        color: isActive ? color : 'rgba(255, 255, 255, 0.5)',
                    }}
                >
                    {icon}
                </div>
                <div>
                    <h3 className="font-medium text-white/90">{title}</h3>
                    <span
                        className="text-xs"
                        style={{ color: isActive ? color : 'rgba(255, 255, 255, 0.4)' }}
                    >
                        {isActive ? 'Active' : 'Off'}
                    </span>
                </div>
            </div>

            {/* Content */}
            {children}
        </motion.div>
    );
}
