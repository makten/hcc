import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FiShield,
    FiLock,
    FiUnlock
} from 'react-icons/fi';
import { DeviceConfig } from '@/types';
import { hassApi } from '@/services';

interface ModernSecurityCardProps {
    className?: string;
    devices: DeviceConfig[];
    entityStates: Map<string, any>;
    alarmEntityId?: string;
}

export function ModernSecurityCard({ className = "", devices, entityStates, alarmEntityId }: ModernSecurityCardProps) {
    // Mock alarm state if no entity provided (maintaining previous behavior but modernized)
    const [mockArmed, setMockArmed] = useState(true);

    // Get real alarm state if available
    const alarmState = alarmEntityId ? entityStates.get(alarmEntityId) : null;
    const isArmed = alarmEntityId
        ? ['armed_home', 'armed_away', 'armed_night'].includes(alarmState?.state)
        : mockArmed;

    const isTriggered = alarmEntityId ? alarmState?.state === 'triggered' : false;

    // Filter for sensors (binary_sensor or sensor)
    // We look for 'sensor' type or standard binary_sensor prefixes in entityId if type is generic
    const sensors = useMemo(() => {
        return devices.filter(d =>
            d.type === 'sensor' ||
            d.entityId.startsWith('binary_sensor.') ||
            d.entityId.includes('window') ||
            d.entityId.includes('door') ||
            d.entityId.includes('motion')
        );
    }, [devices]);

    // Calculate sensor status
    const openSensors = sensors.filter(s => {
        const state = entityStates.get(s.entityId);
        return state?.state === 'on' || state?.state === 'open'; // 'on' usually means open for binary_sensor
    });

    const allSecure = openSensors.length === 0;

    // Determine card color theme
    const getColor = () => {
        if (isTriggered) return '#ef4444'; // Red
        if (!allSecure && isArmed) return '#f59e0b'; // Amber (Armed but sensors open - warning)
        if (isArmed) return '#10b981'; // Green
        return '#64748b'; // Slate (Disarmed)
    };

    const color = getColor();

    const handleToggleArm = async () => {
        if (alarmEntityId) {
            // Real logic would go here
            if (isArmed) {
                await hassApi.callService('alarm_control_panel', 'alarm_disarm', alarmEntityId);
            } else {
                await hassApi.callService('alarm_control_panel', 'alarm_arm_away', alarmEntityId);
            }
        } else {
            setMockArmed(!mockArmed);
        }
    };

    return (
        <div className={`bg-[#131720] rounded-2xl p-4 flex flex-col relative overflow-hidden border border-white/5 shadow-lg select-none group ${className}`}>
            {/* Background Gradient */}
            <div
                className="absolute inset-0 transition-opacity duration-700 pointer-events-none opacity-10"
                style={{
                    background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`
                }}
            />

            {/* Header */}
            <div className="flex items-center gap-2 mb-3 relative z-10 transition-colors duration-500">
                <div
                    className="p-1.5 rounded-md transition-colors duration-300"
                    style={{
                        backgroundColor: `${color}20`,
                        color: color
                    }}
                >
                    <FiShield size={14} />
                </div>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Security System</span>

                {/* Status Badge */}
                <div className="ml-auto px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-medium text-white/60">
                    {isTriggered ? 'TRIGGERED' : isArmed ? 'ARMED' : 'DISARMED'}
                </div>
            </div>

            {/* Main Status Icon */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-2">
                <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-3 relative"
                    animate={{
                        boxShadow: isTriggered ? `0 0 50px ${color}60` : `0 0 20px ${color}20`,
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="absolute inset-0 rounded-full border-2 opacity-20" style={{ borderColor: color }} />
                    <motion.div
                        className="absolute inset-0 rounded-full border opacity-40"
                        style={{ borderColor: color }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    />

                    <FiShield size={32} style={{ color }} />

                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#131720] flex items-center justify-center border border-white/10">
                        {isArmed ? <FiLock size={12} style={{ color }} /> : <FiUnlock size={12} className="text-white/40" />}
                    </div>
                </motion.div>

                <div className="text-center">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                        {isTriggered ? 'ALARM TRIGGERED' : isArmed ? 'Home Secure' : 'System Disarmed'}
                    </h3>
                    <p className="text-[10px] text-white/40 mt-1">
                        {allSecure ? 'All sensors closed' : `${openSensors.length} sensors open`}
                    </p>
                </div>
            </div>

            {/* Sensor List (Mini) */}
            <div className="mt-auto mb-3 flex flex-col gap-1.5 max-h-24 overflow-y-auto px-1 relative z-10 scrollbar-hide">
                {sensors.slice(0, 3).map(sensor => {
                    const state = entityStates.get(sensor.entityId);
                    const isOpen = state?.state === 'on' || state?.state === 'open';

                    return (
                        <div key={sensor.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-green-500/50'}`} />
                                <span className="text-[10px] text-white/80 truncate max-w-[100px]">{sensor.name}</span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase ${isOpen ? 'text-red-400' : 'text-white/30'}`}>
                                {isOpen ? 'Open' : 'Closed'}
                            </span>
                        </div>
                    );
                })}
                {sensors.length === 0 && (
                    <div className="text-[9px] text-white/30 text-center py-1">No sensors in room</div>
                )}
            </div>

            {/* Arm Button */}
            <button
                onClick={handleToggleArm}
                className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all relative z-10 overflow-hidden group/btn"
                style={{
                    backgroundColor: isArmed ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    color: isArmed ? '#ef4444' : '#10b981',
                    border: `1px solid ${isArmed ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`
                }}
            >
                <div className={`absolute inset-0 opacity-0 group-hover/btn:opacity-10 transition-opacity ${isArmed ? 'bg-red-500' : 'bg-green-500'}`} />
                {isArmed ? 'Disarm System' : 'Arm to Away'}
            </button>
        </div>
    );
}
