import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiThermometer, FiDroplet, FiWind, FiSun } from 'react-icons/fi';
import DeviceCard from './DeviceCard';
import { useMockEntity } from '@/hooks';
import { ClimateAttributes } from '@/types';

interface ClimateCardProps {
    entityId: string;
    name: string;
    deviceId?: string;
    roomId?: string;
}

const HVAC_MODES = [
    { mode: 'off', label: 'Off', icon: <FiThermometer size={16} />, color: '#6b7280' },
    { mode: 'heat', label: 'Heat', icon: <FiSun size={16} />, color: '#f97316' },
    { mode: 'cool', label: 'Cool', icon: <FiWind size={16} />, color: '#00d4ff' },
    { mode: 'auto', label: 'Auto', icon: <FiDroplet size={16} />, color: '#a855f7' },
];

export default function ClimateCard({ entityId, name, deviceId, roomId }: ClimateCardProps) {
    const { state, setTemperature, setHvacMode } = useMockEntity(entityId);
    const attributes = state.attributes as ClimateAttributes;
    const currentTemp = attributes.current_temperature ?? 20;
    const targetTemp = attributes.temperature ?? 21;
    const hvacMode = state.state;

    const [isDragging, setIsDragging] = useState(false);
    const dialRef = useRef<HTMLDivElement>(null);

    // Calculate dial rotation based on temperature (16-30°C range)
    const minTemp = 16;
    const maxTemp = 30;
    const tempRange = maxTemp - minTemp;
    const tempProgress = (targetTemp - minTemp) / tempRange;
    // dialRotation calculation removed - was unused

    // Handle dial interaction
    const handleDialMove = (clientX: number, clientY: number) => {
        if (!dialRef.current) return;

        const rect = dialRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const angle = Math.atan2(clientY - centerY, clientX - centerX);
        const degrees = (angle * 180) / Math.PI;

        // Map angle to temperature (-135° to 135° = 16°C to 30°C)
        const normalizedAngle = Math.max(-135, Math.min(135, degrees + 90));
        const newTemp = Math.round(((normalizedAngle + 135) / 270) * tempRange + minTemp);

        setTemperature(Math.max(minTemp, Math.min(maxTemp, newTemp)));
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            handleDialMove(e.clientX, e.clientY);
        }
    };

    const currentModeConfig = HVAC_MODES.find((m) => m.mode === hvacMode) || HVAC_MODES[0];

    return (
        <DeviceCard
            title={name}
            icon={<FiThermometer size={20} />}
            isActive={hvacMode !== 'off'}
            color={currentModeConfig.color}
            deviceId={deviceId}
            roomId={roomId}
        >
            {/* Circular thermostat dial */}
            <div className="flex justify-center mb-4">
                <div
                    ref={dialRef}
                    className="relative w-40 h-40 cursor-pointer select-none"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Background ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent border border-white/10" />

                    {/* Progress ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-[225deg]">
                        <circle
                            cx="80"
                            cy="80"
                            r="72"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="6"
                            strokeDasharray={`${270 * (Math.PI * 144 / 360)} ${Math.PI * 144}`}
                            strokeLinecap="round"
                        />
                        <circle
                            cx="80"
                            cy="80"
                            r="72"
                            fill="none"
                            stroke={currentModeConfig.color}
                            strokeWidth="6"
                            strokeDasharray={`${tempProgress * 270 * (Math.PI * 144 / 360)} ${Math.PI * 144}`}
                            strokeLinecap="round"
                            style={{
                                filter: `drop-shadow(0 0 6px ${currentModeConfig.color})`,
                            }}
                        />
                    </svg>

                    {/* Center display */}
                    <div className="absolute inset-4 rounded-full bg-background-lighter flex flex-col items-center justify-center border border-white/10">
                        <span className="text-4xl font-light text-white">{targetTemp}°</span>
                        <span className="text-xs text-white/50 mt-1">Target</span>
                        <div className="flex items-center gap-1 mt-2 text-white/40 text-xs">
                            <FiThermometer size={12} />
                            <span>Current: {currentTemp}°</span>
                        </div>
                    </div>

                    {/* Temperature indicators */}
                    <div className="absolute bottom-0 left-0 text-xs text-white/30">{minTemp}°</div>
                    <div className="absolute bottom-0 right-0 text-xs text-white/30">{maxTemp}°</div>
                </div>
            </div>

            {/* HVAC mode selector */}
            <div className="grid grid-cols-4 gap-2">
                {HVAC_MODES.map((mode) => (
                    <motion.button
                        key={mode.mode}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setHvacMode(mode.mode)}
                        className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all duration-200 ${hvacMode === mode.mode
                            ? 'border'
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                        style={{
                            background: hvacMode === mode.mode ? `${mode.color}20` : undefined,
                            borderColor: hvacMode === mode.mode ? `${mode.color}50` : 'transparent',
                            color: hvacMode === mode.mode ? mode.color : undefined,
                        }}
                    >
                        {mode.icon}
                        <span className="text-xs">{mode.label}</span>
                    </motion.button>
                ))}
            </div>
        </DeviceCard>
    );
}
