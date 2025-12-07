import React from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiHome, FiBattery } from 'react-icons/fi';
import DeviceCard from './DeviceCard';
import { useMockEntity } from '@/hooks';
import { VacuumAttributes } from '@/types';

interface VacuumCardProps {
    entityId: string;
    name: string;
    deviceId?: string;
    roomId?: string;
}

export default function VacuumCard({ entityId, name, deviceId, roomId }: VacuumCardProps) {
    const { state, vacuumStart, vacuumDock } = useMockEntity(entityId);
    const attributes = state.attributes as VacuumAttributes;
    const batteryLevel = attributes.battery_level ?? 100;
    const status = state.state;

    const isCleaning = status === 'cleaning';
    const isReturning = status === 'returning';

    // Battery color based on level
    const getBatteryColor = () => {
        if (batteryLevel > 60) return '#00ff88';
        if (batteryLevel > 30) return '#ffcc00';
        return '#ff6b35';
    };

    return (
        <DeviceCard
            title={name}
            icon={
                <motion.div
                    animate={{ rotate: isCleaning ? 360 : 0 }}
                    transition={{ duration: 2, repeat: isCleaning ? Infinity : 0, ease: 'linear' }}
                >
                    🤖
                </motion.div>
            }
            isActive={isCleaning || isReturning}
            color="#00ff88"
            deviceId={deviceId}
            roomId={roomId}
        >
            {/* Status display */}
            <div className="flex flex-col items-center mb-4">
                {/* Battery ring */}
                <div className="relative w-32 h-32 mb-3">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                        />
                        <motion.circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke={getBatteryColor()}
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 56}
                            initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                            animate={{
                                strokeDashoffset: 2 * Math.PI * 56 * (1 - batteryLevel / 100),
                            }}
                            strokeLinecap="round"
                            style={{
                                filter: `drop-shadow(0 0 6px ${getBatteryColor()})`,
                            }}
                        />
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1" style={{ color: getBatteryColor() }}>
                            <FiBattery size={16} />
                            <span className="text-2xl font-light">{batteryLevel}%</span>
                        </div>
                        <span className="text-xs text-white/50 mt-1 capitalize">{status}</span>
                    </div>
                </div>

                {/* Status message */}
                <motion.div
                    key={status}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-white/60"
                >
                    {isCleaning && (
                        <span className="flex items-center gap-2">
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-2 h-2 bg-green-400 rounded-full"
                            />
                            Cleaning in progress...
                        </span>
                    )}
                    {isReturning && (
                        <span className="flex items-center gap-2">
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="w-2 h-2 bg-yellow-400 rounded-full"
                            />
                            Returning to dock...
                        </span>
                    )}
                    {status === 'docked' && 'Ready to clean'}
                </motion.div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={vacuumStart}
                    disabled={isCleaning}
                    className={`py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-200 ${isCleaning
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border border-green-500/30 hover:from-green-500/40 hover:to-emerald-500/40'
                        }`}
                >
                    <FiPlay size={16} />
                    Start
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={vacuumDock}
                    disabled={status === 'docked'}
                    className={`py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-200 ${status === 'docked'
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border border-blue-500/30 hover:from-blue-500/40 hover:to-cyan-500/40'
                        }`}
                >
                    <FiHome size={16} />
                    Dock
                </motion.button>
            </div>
        </DeviceCard>
    );
}
