import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSun, FiZap, FiDroplet, FiThermometer } from 'react-icons/fi';
import { DeviceConfig, LightAttributes } from '@/types';
import { hassApi } from '@/services';
import { useApp } from '@/context';

interface LightControlModalProps {
    device: DeviceConfig;
    state: {
        state: string;
        attributes?: LightAttributes;
    } | undefined;
    isOpen: boolean;
    onClose: () => void;
    onStateChange?: () => void;
}

// Color presets for quick selection
const COLOR_PRESETS = [
    { name: 'Warm', color: '#ff9500', temp: 2700 },
    { name: 'Soft White', color: '#ffc864', temp: 3000 },
    { name: 'Neutral', color: '#fff4e5', temp: 4000 },
    { name: 'Daylight', color: '#f5f5ff', temp: 5500 },
    { name: 'Cool', color: '#e6f0ff', temp: 6500 },
];

// RGB color presets
const RGB_PRESETS = [
    { name: 'Red', rgb: [255, 0, 0] },
    { name: 'Orange', rgb: [255, 165, 0] },
    { name: 'Yellow', rgb: [255, 255, 0] },
    { name: 'Green', rgb: [0, 255, 0] },
    { name: 'Cyan', rgb: [0, 255, 255] },
    { name: 'Blue', rgb: [0, 0, 255] },
    { name: 'Purple', rgb: [128, 0, 255] },
    { name: 'Pink', rgb: [255, 0, 128] },
    { name: 'White', rgb: [255, 255, 255] },
];

export function LightControlModal({ device, state, isOpen, onClose, onStateChange }: LightControlModalProps) {
    const { config } = useApp();
    const isConnected = config.homeAssistant.connected;

    const attributes = state?.attributes;
    const isOn = state?.state === 'on';
    const isUnavailable = state?.state === 'unavailable' || !state;

    // Local state for controls
    const [brightness, setBrightness] = useState(attributes?.brightness ?? 255);
    const [colorTemp, setColorTemp] = useState(attributes?.color_temp ?? 370);
    const [rgbColor, setRgbColor] = useState<[number, number, number]>(
        (Array.isArray(attributes?.rgb_color) ? attributes.rgb_color as [number, number, number] : null) ?? [255, 255, 255]
    );
    const [isLoading, setIsLoading] = useState(false);

    // Determine supported features from color_mode or supported_color_modes
    const colorMode = attributes?.color_mode;
    const supportedModes: string[] = (attributes as any)?.supported_color_modes ?? [];

    const supportsBrightness = colorMode === 'brightness' ||
        supportedModes.includes('brightness') ||
        supportedModes.includes('color_temp') ||
        supportedModes.includes('rgb') ||
        supportedModes.includes('hs') ||
        supportedModes.includes('xy') ||
        attributes?.brightness !== undefined;

    const supportsColorTemp = colorMode === 'color_temp' ||
        supportedModes.includes('color_temp') ||
        attributes?.color_temp !== undefined;

    const supportsRgb = colorMode === 'rgb' ||
        colorMode === 'hs' ||
        colorMode === 'xy' ||
        supportedModes.includes('rgb') ||
        supportedModes.includes('hs') ||
        supportedModes.includes('xy') ||
        attributes?.rgb_color !== undefined;

    // Update local state when attributes change
    useEffect(() => {
        if (attributes?.brightness !== undefined) {
            setBrightness(attributes.brightness);
        }
        if (attributes?.color_temp !== undefined) {
            setColorTemp(attributes.color_temp);
        }
        if (Array.isArray(attributes?.rgb_color) && attributes.rgb_color.length === 3) {
            setRgbColor(attributes.rgb_color as [number, number, number]);
        }
    }, [attributes]);

    const handleToggle = async () => {
        if (!isConnected || isUnavailable) return;
        setIsLoading(true);
        try {
            if (isOn) {
                await hassApi.turnOff(device.entityId);
            } else {
                await hassApi.turnOn(device.entityId);
            }
            onStateChange?.();
        } catch (error) {
            console.error('Failed to toggle light:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBrightnessChange = async (value: number) => {
        setBrightness(value);
        if (!isConnected) return;

        try {
            await hassApi.callService('light', 'turn_on', device.entityId, { brightness: value });
            onStateChange?.();
        } catch (error) {
            console.error('Failed to set brightness:', error);
        }
    };

    const handleColorTempChange = async (value: number) => {
        setColorTemp(value);
        if (!isConnected) return;

        try {
            await hassApi.callService('light', 'turn_on', device.entityId, { color_temp: value });
            onStateChange?.();
        } catch (error) {
            console.error('Failed to set color temp:', error);
        }
    };

    const handleColorPreset = async (temp: number) => {
        setColorTemp(temp);
        if (!isConnected) return;

        try {
            // Convert kelvin to mireds (1,000,000 / kelvin)
            const mireds = Math.round(1000000 / temp);
            await hassApi.callService('light', 'turn_on', device.entityId, { color_temp: mireds });
            onStateChange?.();
        } catch (error) {
            console.error('Failed to set color preset:', error);
        }
    };

    const handleRgbColor = async (rgb: number[]) => {
        setRgbColor(rgb as [number, number, number]);
        if (!isConnected) return;

        try {
            await hassApi.callService('light', 'turn_on', device.entityId, { rgb_color: rgb });
            onStateChange?.();
        } catch (error) {
            console.error('Failed to set RGB color:', error);
        }
    };

    const brightnessPercent = Math.round((brightness / 255) * 100);

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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#131720] rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOn ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/40'
                                    }`}>
                                    <FiSun size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{device.name}</h3>
                                    <p className="text-xs text-white/40">{device.entityId}</p>
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
                        <div className="p-5 space-y-6">
                            {/* Status & Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className={`text-sm font-medium ${isUnavailable ? 'text-red-400' : isOn ? 'text-amber-400' : 'text-white/50'
                                        }`}>
                                        {isUnavailable ? 'Unavailable' : isOn ? 'On' : 'Off'}
                                    </span>
                                    {isOn && supportsBrightness && (
                                        <span className="text-white/30 ml-2">• {brightnessPercent}%</span>
                                    )}
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleToggle}
                                    disabled={isUnavailable || isLoading}
                                    className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${isUnavailable
                                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                        : isOn
                                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                >
                                    <FiZap size={16} />
                                    {isLoading ? 'Loading...' : isOn ? 'Turn Off' : 'Turn On'}
                                </motion.button>
                            </div>

                            {/* Brightness Slider */}
                            {supportsBrightness && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white/60 flex items-center gap-2">
                                            <FiSun size={14} />
                                            Brightness
                                        </span>
                                        <span className="text-sm text-amber-400 font-mono">{brightnessPercent}%</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="1"
                                            max="255"
                                            value={brightness}
                                            onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
                                            disabled={!isOn || isUnavailable}
                                            className="w-full h-3 appearance-none rounded-full bg-[#0a0d14] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                background: isOn
                                                    ? `linear-gradient(to right, #fbbf24 ${brightnessPercent}%, #0a0d14 ${brightnessPercent}%)`
                                                    : '#0a0d14'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Color Temperature */}
                            {supportsColorTemp && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <FiThermometer size={14} className="text-white/60" />
                                        <span className="text-sm text-white/60">Color Temperature</span>
                                    </div>

                                    {/* Temperature slider */}
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="153"
                                            max="500"
                                            value={colorTemp}
                                            onChange={(e) => handleColorTempChange(parseInt(e.target.value))}
                                            disabled={!isOn || isUnavailable}
                                            className="w-full h-3 appearance-none rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                background: 'linear-gradient(to right, #ff9500, #ffc864, #fff4e5, #f5f5ff, #e6f0ff)'
                                            }}
                                        />
                                    </div>

                                    {/* Presets */}
                                    <div className="flex gap-2">
                                        {COLOR_PRESETS.map((preset) => (
                                            <button
                                                key={preset.name}
                                                onClick={() => handleColorPreset(preset.temp)}
                                                disabled={!isOn || isUnavailable}
                                                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                style={{
                                                    background: `${preset.color}20`,
                                                    color: preset.color,
                                                    border: `1px solid ${preset.color}30`
                                                }}
                                            >
                                                {preset.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* RGB Color */}
                            {supportsRgb && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <FiDroplet size={14} className="text-white/60" />
                                        <span className="text-sm text-white/60">Color</span>
                                    </div>

                                    {/* Color presets grid */}
                                    <div className="grid grid-cols-9 gap-2">
                                        {RGB_PRESETS.map((preset) => (
                                            <button
                                                key={preset.name}
                                                onClick={() => handleRgbColor(preset.rgb)}
                                                disabled={!isOn || isUnavailable}
                                                className="aspect-square rounded-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2"
                                                style={{
                                                    background: `rgb(${preset.rgb.join(',')})`,
                                                    borderColor: (rgbColor || [255, 255, 255]).join(',') === preset.rgb.join(',')
                                                        ? 'white'
                                                        : 'transparent'
                                                }}
                                                title={preset.name}
                                            />
                                        ))}
                                    </div>

                                    {/* Current color preview */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg border border-white/20"
                                            style={{ background: `rgb(${(rgbColor || [255, 255, 255]).join(',')})` }}
                                        />
                                        <span className="text-xs text-white/40 font-mono">
                                            RGB({(rgbColor || [255, 255, 255]).join(', ')})
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* No controls available message */}
                            {!supportsBrightness && !supportsColorTemp && !supportsRgb && (
                                <div className="text-center py-4 text-white/40 text-sm">
                                    <p>This light only supports on/off control.</p>
                                    {!isConnected && (
                                        <p className="mt-2 text-xs">Connect to Home Assistant to see available features.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 bg-white/2 border-t border-white/5">
                            <div className="flex items-center justify-between text-xs text-white/30">
                                <span>
                                    {colorMode ? `Mode: ${colorMode}` : 'Mode: unknown'}
                                </span>
                                <span>
                                    {isConnected ? 'Connected' : 'Not connected'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
