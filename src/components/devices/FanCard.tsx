// React is auto-imported by the JSX transform
import { motion } from 'framer-motion';
import { FiWind } from 'react-icons/fi';
import DeviceCard from './DeviceCard';
import { useMockEntity } from '@/hooks';
import { FanAttributes } from '@/types';

interface FanCardProps {
    entityId: string;
    name: string;
    deviceId?: string;
    roomId?: string;
}

const FAN_SPEEDS = [
    { value: 0, label: 'Off' },
    { value: 33, label: 'Low' },
    { value: 66, label: 'Med' },
    { value: 100, label: 'High' },
];

export default function FanCard({ entityId, name, deviceId, roomId }: FanCardProps) {
    const { state, isOn, setFanSpeed } = useMockEntity(entityId);
    const attributes = state.attributes as FanAttributes;
    const percentage = attributes.percentage ?? 0;

    // Find current speed level
    const currentSpeed = FAN_SPEEDS.reduce((prev, curr) =>
        Math.abs(curr.value - percentage) < Math.abs(prev.value - percentage) ? curr : prev
    );

    return (
        <DeviceCard
            title={name}
            icon={
                <motion.div
                    animate={{ rotate: isOn ? 360 : 0 }}
                    transition={{ duration: isOn ? 1 : 0, repeat: isOn ? Infinity : 0, ease: 'linear' }}
                >
                    <FiWind size={20} />
                </motion.div>
            }
            isActive={isOn}
            color="#00d4ff"
            deviceId={deviceId}
            roomId={roomId}
        >
            {/* Speed indicator */}
            <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                    {/* Animated fan blades */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ rotate: isOn ? 360 : 0 }}
                        transition={{
                            duration: isOn ? 2 - (percentage / 100) * 1.5 : 0,
                            repeat: isOn ? Infinity : 0,
                            ease: 'linear',
                        }}
                    >
                        {[0, 60, 120, 180, 240, 300].map((rotation) => (
                            <div
                                key={rotation}
                                className="absolute w-3 h-10 rounded-full origin-bottom"
                                style={{
                                    transform: `rotate(${rotation}deg) translateY(-20px)`,
                                    background: isOn
                                        ? 'linear-gradient(to top, #00d4ff, transparent)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                }}
                            />
                        ))}
                        <div
                            className="absolute w-8 h-8 rounded-full border-2"
                            style={{
                                borderColor: isOn ? '#00d4ff' : 'rgba(255, 255, 255, 0.2)',
                                background: isOn
                                    ? 'radial-gradient(circle, #00d4ff20, transparent)'
                                    : 'rgba(255, 255, 255, 0.05)',
                            }}
                        />
                    </motion.div>

                    {/* Speed text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span
                            className="text-xs font-medium px-2 py-1 rounded-full"
                            style={{
                                background: isOn ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                color: isOn ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                            }}
                        >
                            {currentSpeed.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Speed selector buttons */}
            <div className="grid grid-cols-4 gap-2">
                {FAN_SPEEDS.map((speed) => (
                    <motion.button
                        key={speed.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFanSpeed(speed.value)}
                        className={`py-2 rounded-xl text-xs font-medium transition-all duration-200 ${currentSpeed.value === speed.value
                            ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-500/30'
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                            }`}
                    >
                        {speed.label}
                    </motion.button>
                ))}
            </div>
        </DeviceCard>
    );
}
