import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiZap } from 'react-icons/fi';
import DeviceCard from './DeviceCard';
import { useEntity } from '@/hooks';
import { LightAttributes } from '@/types';

interface LightCardProps {
    entityId: string;
    name: string;
    deviceId?: string;
    roomId?: string;
}

export default function LightCard({ entityId, name, deviceId, roomId }: LightCardProps) {
    const { state, isOn, toggle, setBrightness } = useEntity(entityId);
    const attributes = state.attributes as LightAttributes;
    const brightness = attributes.brightness ?? 0;
    const brightnessPercent = Math.round((brightness / 255) * 100);

    const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.round((parseInt(e.target.value) / 100) * 255);
        setBrightness(value);
    };

    return (
        <DeviceCard
            title={name}
            icon={<FiSun size={20} />}
            isActive={isOn}
            color="#ffcc00"
            deviceId={deviceId}
            roomId={roomId}
        >
            {/* Toggle button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggle}
                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 mb-4 font-medium transition-all duration-300 ${isOn
                    ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border border-yellow-500/30'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                    }`}
            >
                <FiZap size={16} />
                {isOn ? 'Turn Off' : 'Turn On'}
            </motion.button>

            {/* Brightness slider */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-white/50">Brightness</span>
                    <span className="text-white/80">{brightnessPercent}%</span>
                </div>
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={brightnessPercent}
                        onChange={handleBrightnessChange}
                        className="w-full h-2 appearance-none rounded-full bg-white/10"
                        style={{
                            background: `linear-gradient(to right, #ffcc00 ${brightnessPercent}%, rgba(255,255,255,0.1) ${brightnessPercent}%)`,
                        }}
                    />
                </div>
            </div>
        </DeviceCard>
    );
}
