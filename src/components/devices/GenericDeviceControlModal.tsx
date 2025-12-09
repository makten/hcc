import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPower, FiCpu } from 'react-icons/fi';
import { DeviceConfig } from '@/types';
import { hassApi, HassState } from '@/services';
import { useApp } from '@/context';

interface GenericDeviceControlModalProps {
    device: DeviceConfig;
    state: HassState | undefined;
    isOpen: boolean;
    onClose: () => void;
}

export function GenericDeviceControlModal({ device, state, isOpen, onClose }: GenericDeviceControlModalProps) {
    const { config } = useApp();
    const isConnected = config.homeAssistant.connected;
    const [isLoading, setIsLoading] = useState(false);

    const isOn = state?.state === 'on' || state?.state === 'playing';
    const isUnavailable = state?.state === 'unavailable' || !state;

    const handleToggle = async () => {
        if (!isConnected || isUnavailable) return;
        setIsLoading(true);
        try {
            await hassApi.toggle(device.entityId);
        } catch (error) {
            console.error('Failed to toggle device:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#131720] rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOn ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/40'
                                    }`}>
                                    <FiCpu size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{device.name}</h3>
                                    <p className="text-xs text-white/40">{device.type} • {device.entityId}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col items-center gap-6">

                            {/* Big Toggle Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleToggle}
                                disabled={isUnavailable || isLoading}
                                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-2 transition-all ${isUnavailable ? 'bg-white/5 text-white/20' :
                                    isOn
                                        ? 'bg-purple-500 text-white shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)]'
                                        : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'
                                    }`}
                            >
                                <FiPower size={32} />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {isLoading ? '...' : isOn ? 'ON' : 'OFF'}
                                </span>
                            </motion.button>

                            {/* Status Text */}
                            <div className="text-center">
                                <span className="text-white/40 text-sm">Current State</span>
                                <div className="text-xl font-medium text-white capitalize">
                                    {state?.state || 'Unknown'}
                                </div>
                            </div>

                            {/* Attributes (Simplified) */}
                            {state?.attributes && Object.keys(state.attributes).length > 0 && (
                                <div className="w-full bg-black/20 rounded-xl p-3 border border-white/5 max-h-32 overflow-y-auto text-xs font-mono text-white/50">
                                    {Object.entries(state.attributes).map(([k, v]) => (
                                        <div key={k} className="flex justify-between border-b border-white/5 last:border-0 py-1">
                                            <span>{k}:</span>
                                            <span className="text-white/70">{String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
