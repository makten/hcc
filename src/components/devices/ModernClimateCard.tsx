import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiThermometer,
    FiWind,
    FiPower,
    FiSun,
    FiDroplet
} from 'react-icons/fi';
import { DeviceConfig } from '@/types';
import { hassApi } from '@/services';

interface ModernClimateCardProps {
    devices: DeviceConfig[];
    entityStates: Map<string, any>;
    className?: string;
    onStateChange?: () => void;
}

export function ModernClimateCard({ devices, entityStates, className = "", onStateChange }: ModernClimateCardProps) {
    // Separate devices by type
    const { climate, fan } = useMemo(() => {
        return {
            climate: devices.find(d => d.type === 'climate'),
            fan: devices.find(d => d.type === 'fan')
        };
    }, [devices]);

    // Dimensions for dial
    const DIAL_SIZE = 180;
    const CENTER = DIAL_SIZE / 2;
    const RADIUS = 70;
    const MIN_TEMP = 16;
    const MAX_TEMP = 30;

    // State for interaction
    const [isDragging, setIsDragging] = useState(false);
    const dialRef = useRef<HTMLDivElement>(null);
    const [localTargetTemp, setLocalTargetTemp] = useState<number | null>(null);

    // Get current states
    const climateState = climate ? entityStates.get(climate.entityId) : null;
    const fanState = fan ? entityStates.get(fan.entityId) : null;

    const currentTemp = climateState?.attributes?.current_temperature ?? 22;
    const targetTemp = localTargetTemp ?? climateState?.attributes?.temperature ?? 22;
    const hvacMode = climateState?.state ?? 'off';
    const fanOn = fanState?.state === 'on';

    // Convert temp to angle (135 to 405 degrees)
    const tempToAngle = (temp: number) => {
        const clampped = Math.min(Math.max(temp, MIN_TEMP), MAX_TEMP);
        const percent = (clampped - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
        return 135 + (percent * 270);
    };

    // Handle interaction
    const handleMove = (clientX: number, clientY: number) => {
        if (!dialRef.current || !climate) return;
        const rect = dialRef.current.getBoundingClientRect();
        const x = clientX - (rect.left + rect.width / 2);
        const y = clientY - (rect.top + rect.height / 2);

        let angle = Math.atan2(y, x) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        // Valid range logic: 135 (Start) -> 405/45 (End)
        // Dead zone is 45 to 135
        if (angle > 45 && angle < 135) return;

        let effectiveAngle = angle;
        if (effectiveAngle <= 45) effectiveAngle += 360;

        const percent = (effectiveAngle - 135) / 270;
        const temp = MIN_TEMP + (percent * (MAX_TEMP - MIN_TEMP));

        const newTemp = Math.max(MIN_TEMP, Math.min(MAX_TEMP, Math.round(temp * 2) / 2));
        setLocalTargetTemp(newTemp);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleMove(e.clientX, e.clientY);
    };

    useEffect(() => {
        const handleMouseUp = () => {
            if (isDragging && climate && localTargetTemp !== null) {
                // Commit change
                hassApi.callService('climate', 'set_temperature', climate.entityId, {
                    temperature: localTargetTemp
                }).then(onStateChange);
                setIsDragging(false);
                setLocalTargetTemp(null);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                handleMove(e.clientX, e.clientY);
            }
        };

        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDragging, localTargetTemp, climate]);

    // Cycle fan speed
    const toggleFan = async () => {
        if (!fan) return;
        if (fanOn) {
            await hassApi.turnOff(fan.entityId);
        } else {
            await hassApi.turnOn(fan.entityId);
        }
        if (onStateChange) onStateChange();
    };

    // Set HVAC mode
    const setHvacMode = async (mode: string) => {
        if (!climate) return;
        await hassApi.callService('climate', 'set_hvac_mode', climate.entityId, {
            hvac_mode: mode
        });
        if (onStateChange) onStateChange();
    };

    // Determine colors based on mode
    const getModeColor = () => {
        if (hvacMode === 'heat') return '#f97316'; // Orange
        if (hvacMode === 'cool') return '#22d3ee'; // Cyan
        return '#94a3b8'; // Grey
    };

    const activeColor = getModeColor();

    return (
        <div className={`bg-[#131720] rounded-2xl p-4 flex flex-col relative overflow-hidden border border-white/5 shadow-lg select-none ${className}`}>
            {/* Ambient background glow */}
            <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] pointer-events-none transition-colors duration-700 opacity-20"
                style={{ background: hvacMode !== 'off' ? activeColor : 'transparent' }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <div
                        className="p-1.5 rounded-md transition-colors duration-300"
                        style={{
                            backgroundColor: hvacMode !== 'off' ? `${activeColor}20` : 'rgba(255,255,255,0.1)',
                            color: hvacMode !== 'off' ? activeColor : 'rgba(255,255,255,0.4)'
                        }}
                    >
                        <FiThermometer size={14} />
                    </div>
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Climate Control</span>
                </div>

                {climate && (
                    <div className="flex gap-1">
                        {['heat', 'cool'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setHvacMode(hvacMode === mode ? 'off' : mode)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${hvacMode === mode
                                    ? ''
                                    : 'bg-white/5 text-white/20 hover:bg-white/10 hover:text-white/60'
                                    }`}
                                style={hvacMode === mode ? { backgroundColor: mode === 'heat' ? '#f97316' : '#22d3ee', color: '#000' } : {}}
                                title={mode === 'heat' ? 'Heat Mode' : 'Cool Mode'}
                            >
                                {mode === 'heat' ? <FiSun size={12} /> : <FiDroplet size={12} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Control Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-2">
                {climate ? (
                    <div
                        className="relative cursor-pointer"
                        ref={dialRef}
                        onMouseDown={handleMouseDown}
                        style={{ width: DIAL_SIZE, height: DIAL_SIZE }}
                    >
                        {/* Dial SVG */}
                        <svg width={DIAL_SIZE} height={DIAL_SIZE} viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}>
                            {/* Dial Track */}
                            <circle
                                cx={CENTER}
                                cy={CENTER}
                                r={RADIUS}
                                fill="none"
                                stroke="#1f2937"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${270 * (Math.PI * RADIUS * 2 / 360)} ${Math.PI * RADIUS * 2}`}
                                strokeDashoffset={0}
                                transform={`rotate(135 ${CENTER} ${CENTER})`}
                            />

                            {/* Active Arc */}
                            <motion.circle
                                cx={CENTER}
                                cy={CENTER}
                                r={RADIUS}
                                fill="none"
                                stroke={activeColor}
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${270 * (Math.PI * RADIUS * 2 / 360)} ${Math.PI * RADIUS * 2}`}
                                strokeDashoffset={0}
                                initial={false}
                                animate={{
                                    strokeDashoffset: (270 * (Math.PI * RADIUS * 2 / 360)) * (1 - ((targetTemp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP))),
                                    stroke: activeColor
                                }}
                                transform={`rotate(135 ${CENTER} ${CENTER})`}
                            />

                            {/* Current Temp Indicator (Small dot) */}
                            <motion.circle
                                cx={CENTER + RADIUS * Math.cos((tempToAngle(currentTemp) * Math.PI) / 180)}
                                cy={CENTER + RADIUS * Math.sin((tempToAngle(currentTemp) * Math.PI) / 180)}
                                r="4"
                                fill="#fff"
                                initial={false}
                                animate={{
                                    cx: CENTER + RADIUS * Math.cos((tempToAngle(currentTemp) * Math.PI) / 180),
                                    cy: CENTER + RADIUS * Math.sin((tempToAngle(currentTemp) * Math.PI) / 180)
                                }}
                            />
                        </svg>

                        {/* Thumb / Handle for dragging */}
                        <motion.div
                            className="absolute w-6 h-6 rounded-full bg-white shadow-lg border-2 border-gray-800"
                            style={{
                                top: CENTER - 12 + RADIUS * Math.sin((tempToAngle(targetTemp) * Math.PI) / 180),
                                left: CENTER - 12 + RADIUS * Math.cos((tempToAngle(targetTemp) * Math.PI) / 180),
                            }}
                            animate={{
                                top: CENTER - 12 + RADIUS * Math.sin((tempToAngle(targetTemp) * Math.PI) / 180),
                                left: CENTER - 12 + RADIUS * Math.cos((tempToAngle(targetTemp) * Math.PI) / 180),
                            }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        />

                        {/* Center Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={targetTemp}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="flex flex-col items-center"
                                >
                                    <span className="text-4xl font-bold text-white tracking-tighter" style={{ textShadow: `0 0 20px ${activeColor}50` }}>
                                        {Math.round(targetTemp)}°
                                    </span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Target</span>
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute bottom-[25%] flex items-center gap-1.5 text-white/50 text-[10px] font-medium bg-black/20 px-2 py-0.5 rounded-full">
                                <FiThermometer size={10} />
                                <span>{currentTemp}°</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-white/30 text-xs text-center px-4">
                        No thermostat configured for this room.
                    </div>
                )}
            </div>

            {/* Footer / Fan Control */}
            <div className="mt-auto pt-3 border-t border-white/5 relative z-10">
                {fan ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full ${fanOn ? 'bg-cyan-500/20 text-cyan-400 animate-spin-slow' : 'bg-white/5 text-white/30'}`}>
                                <FiWind size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-white">{fan.name}</span>
                                <span className="text-[9px] text-white/40">{fanOn ? 'Running' : 'Off'}</span>
                            </div>
                        </div>

                        <button
                            onClick={toggleFan}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${fanOn
                                ? 'bg-cyan-500 text-black shadow-[0_0_15px_#22d3ee50]'
                                : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                                }`}
                        >
                            <FiPower size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="text-[9px] text-white/30 flex items-center justify-center py-2">
                        No fan configured
                    </div>
                )}
            </div>

            <style>{`
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
