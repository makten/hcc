import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlay,
    FiPause,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiClock,
    FiZap,
    FiSunrise,
    FiSunset,
    FiToggleLeft,
    FiToggleRight,
    FiChevronRight,
    FiX,
    FiCheck,
    FiHome,
    FiMoon,
    FiSun,
    FiFilm,
    FiWind,
    FiThermometer
} from 'react-icons/fi';
import { useScenes } from '@/context';
import { useApp } from '@/context';
import { SceneAction, AutomationTrigger, AutomationCondition } from '@/types';

// Available icons for scenes
const SCENE_ICONS = ['🌙', '☀️', '🎬', '🍽️', '🎉', '💤', '🏠', '🚪', '🔒', '🌅', '🌆', '❄️', '🔥'];
const SCENE_COLORS = ['#00d4ff', '#fbbf24', '#a855f7', '#ef4444', '#22c55e', '#3b82f6', '#f97316', '#ec4899'];

// Action types available
const ACTION_TYPES = [
    { id: 'turn_on', label: 'Turn On', icon: <FiSun size={16} /> },
    { id: 'turn_off', label: 'Turn Off', icon: <FiMoon size={16} /> },
    { id: 'set_brightness', label: 'Set Brightness', icon: <FiSun size={16} /> },
    { id: 'set_color', label: 'Set Color', icon: <FiFilm size={16} /> },
    { id: 'set_temperature', label: 'Set Temperature', icon: <FiThermometer size={16} /> },
    { id: 'set_fan_mode', label: 'Set Fan Mode', icon: <FiWind size={16} /> },
    { id: 'activate_scene', label: 'Activate Scene', icon: <FiPlay size={16} /> },
];

// Trigger types available
const TRIGGER_TYPES = [
    { id: 'time', label: 'At Specific Time', icon: <FiClock size={16} /> },
    { id: 'sunrise', label: 'At Sunrise', icon: <FiSunrise size={16} /> },
    { id: 'sunset', label: 'At Sunset', icon: <FiSunset size={16} /> },
    { id: 'device_state', label: 'Device State Change', icon: <FiZap size={16} /> },
    { id: 'motion_detected', label: 'Motion Detected', icon: <FiHome size={16} /> },
];

export function ScenesPage() {
    const { scenes, automations, activateScene, deactivateScene, toggleAutomation, deleteScene, deleteAutomation, createScene, createAutomation, updateScene, updateAutomation } = useScenes();
    const { config } = useApp();
    const [activeTab, setActiveTab] = useState<'scenes' | 'automations'>('scenes');
    const [selectedScene, setSelectedScene] = useState<string | null>(null);
    const [isActivating, setIsActivating] = useState<string | null>(null);

    // Modal states
    const [showSceneModal, setShowSceneModal] = useState(false);
    const [showAutomationModal, setShowAutomationModal] = useState(false);
    const [editingScene, setEditingScene] = useState<string | null>(null);
    const [editingAutomation, setEditingAutomation] = useState<string | null>(null);

    // Scene form state
    const [sceneForm, setSceneForm] = useState({
        name: '',
        description: '',
        icon: '🎬',
        color: '#00d4ff',
        roomId: '',
        actions: [] as Omit<SceneAction, 'id'>[],
    });

    // Automation form state
    const [automationForm, setAutomationForm] = useState({
        name: '',
        description: '',
        icon: '⚡',
        color: '#a855f7',
        triggers: [] as Omit<AutomationTrigger, 'id'>[],
        conditions: [] as Omit<AutomationCondition, 'id'>[],
        actions: [] as Omit<SceneAction, 'id'>[],
    });

    const handleActivateScene = async (sceneId: string) => {
        setIsActivating(sceneId);
        await activateScene(sceneId);
        setIsActivating(null);

        setTimeout(() => {
            deactivateScene(sceneId);
        }, 3000);
    };

    const openCreateSceneModal = () => {
        setSceneForm({
            name: '',
            description: '',
            icon: '🎬',
            color: '#00d4ff',
            roomId: '',
            actions: [],
        });
        setEditingScene(null);
        setShowSceneModal(true);
    };

    const openEditSceneModal = (sceneId: string) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (scene) {
            setSceneForm({
                name: scene.name,
                description: scene.description || '',
                icon: scene.icon,
                color: scene.color,
                roomId: scene.roomId || '',
                actions: scene.actions.map(({ id, ...rest }) => rest),
            });
            setEditingScene(sceneId);
            setShowSceneModal(true);
        }
    };

    const openCreateAutomationModal = () => {
        setAutomationForm({
            name: '',
            description: '',
            icon: '⚡',
            color: '#a855f7',
            triggers: [],
            conditions: [],
            actions: [],
        });
        setEditingAutomation(null);
        setShowAutomationModal(true);
    };

    const openEditAutomationModal = (automationId: string) => {
        const automation = automations.find(a => a.id === automationId);
        if (automation) {
            setAutomationForm({
                name: automation.name,
                description: automation.description || '',
                icon: automation.icon,
                color: automation.color,
                triggers: automation.triggers.map(({ id, ...rest }) => rest),
                conditions: automation.conditions.map(({ id, ...rest }) => rest),
                actions: automation.actions.map(({ id, ...rest }) => rest),
            });
            setEditingAutomation(automationId);
            setShowAutomationModal(true);
        }
    };

    const handleSaveScene = () => {
        if (!sceneForm.name.trim()) return;

        const sceneData = {
            name: sceneForm.name,
            description: sceneForm.description,
            icon: sceneForm.icon,
            color: sceneForm.color,
            roomId: sceneForm.roomId || undefined,
            actions: sceneForm.actions,
        };

        if (editingScene) {
            updateScene(editingScene, sceneData);
        } else {
            createScene(sceneData);
        }
        setShowSceneModal(false);
    };

    const handleSaveAutomation = () => {
        if (!automationForm.name.trim() || automationForm.triggers.length === 0) return;

        const automationData = {
            name: automationForm.name,
            description: automationForm.description,
            icon: automationForm.icon,
            color: automationForm.color,
            triggers: automationForm.triggers,
            conditions: automationForm.conditions,
            actions: automationForm.actions,
            enabled: true,
        };

        if (editingAutomation) {
            updateAutomation(editingAutomation, automationData);
        } else {
            createAutomation(automationData);
        }
        setShowAutomationModal(false);
    };

    const addSceneAction = () => {
        setSceneForm(prev => ({
            ...prev,
            actions: [...prev.actions, { type: 'turn_on', entityId: '', value: undefined }],
        }));
    };

    const updateSceneAction = (index: number, updates: Partial<Omit<SceneAction, 'id'>>) => {
        setSceneForm(prev => ({
            ...prev,
            actions: prev.actions.map((action, i) => i === index ? { ...action, ...updates } : action),
        }));
    };

    const removeSceneAction = (index: number) => {
        setSceneForm(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index),
        }));
    };

    const addAutomationTrigger = () => {
        setAutomationForm(prev => ({
            ...prev,
            triggers: [...prev.triggers, { type: 'time', config: {} }],
        }));
    };

    const updateAutomationTrigger = (index: number, updates: Partial<Omit<AutomationTrigger, 'id'>>) => {
        setAutomationForm(prev => ({
            ...prev,
            triggers: prev.triggers.map((trigger, i) => i === index ? { ...trigger, ...updates } : trigger),
        }));
    };

    const removeAutomationTrigger = (index: number) => {
        setAutomationForm(prev => ({
            ...prev,
            triggers: prev.triggers.filter((_, i) => i !== index),
        }));
    };

    const addAutomationAction = () => {
        setAutomationForm(prev => ({
            ...prev,
            actions: [...prev.actions, { type: 'turn_on', entityId: '', value: undefined }],
        }));
    };

    const updateAutomationAction = (index: number, updates: Partial<Omit<SceneAction, 'id'>>) => {
        setAutomationForm(prev => ({
            ...prev,
            actions: prev.actions.map((action, i) => i === index ? { ...action, ...updates } : action),
        }));
    };

    const removeAutomationAction = (index: number) => {
        setAutomationForm(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index),
        }));
    };

    // Get all devices from config for entity selection
    const getAllDevices = () => {
        const devices: { id: string; name: string; room: string }[] = [];
        config.rooms.forEach(room => {
            room.devices.forEach(device => {
                devices.push({ id: device.entityId, name: device.name, room: room.name });
            });
        });
        return devices;
    };

    const allDevices = getAllDevices();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Scenes & Automations</h1>
                    <p className="text-white/50">Create and manage your smart home routines</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => activeTab === 'scenes' ? openCreateSceneModal() : openCreateAutomationModal()}
                    className="px-4 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors flex items-center gap-2"
                >
                    <FiPlus size={18} />
                    Create {activeTab === 'scenes' ? 'Scene' : 'Automation'}
                </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                {(['scenes', 'automations'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all capitalize ${activeTab === tab
                            ? 'bg-white/10 text-white'
                            : 'text-white/50 hover:text-white'
                            }`}
                    >
                        {tab === 'scenes' ? '🎬 Scenes' : '⚡ Automations'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'scenes' ? (
                    <motion.div
                        key="scenes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {scenes.map((scene, index) => (
                            <motion.div
                                key={scene.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative p-6 rounded-2xl border transition-all cursor-pointer group ${scene.isActive
                                    ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/50'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                                onClick={() => setSelectedScene(scene.id)}
                            >
                                {/* Icon */}
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                                    style={{ backgroundColor: `${scene.color}20` }}
                                >
                                    {scene.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-white mb-1">{scene.name}</h3>
                                <p className="text-sm text-white/50 mb-4 line-clamp-2">
                                    {scene.description || `${scene.actions.length} actions`}
                                </p>

                                {/* Actions preview */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {scene.actions.slice(0, 3).map((action) => (
                                        <span
                                            key={action.id}
                                            className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/60"
                                        >
                                            {action.type.replace('_', ' ')}
                                        </span>
                                    ))}
                                    {scene.actions.length > 3 && (
                                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/60">
                                            +{scene.actions.length - 3} more
                                        </span>
                                    )}
                                </div>

                                {/* Activate Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleActivateScene(scene.id);
                                    }}
                                    disabled={isActivating === scene.id}
                                    className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${scene.isActive
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                >
                                    {isActivating === scene.id ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <FiZap size={18} />
                                            </motion.div>
                                            Activating...
                                        </>
                                    ) : scene.isActive ? (
                                        <>
                                            <FiPause size={18} />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <FiPlay size={18} />
                                            Activate
                                        </>
                                    )}
                                </motion.button>

                                {/* Last triggered */}
                                {scene.lastTriggered && (
                                    <p className="text-xs text-white/30 text-center mt-2 flex items-center justify-center gap-1">
                                        <FiClock size={12} />
                                        Last: {new Date(scene.lastTriggered).toLocaleDateString()}
                                    </p>
                                )}

                                {/* Hover actions */}
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditSceneModal(scene.id);
                                        }}
                                        className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
                                    >
                                        <FiEdit2 size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteScene(scene.id);
                                        }}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/20"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add Scene Card */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: scenes.length * 0.05 }}
                            onClick={openCreateSceneModal}
                            className="p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-cyan-500/50 transition-all flex flex-col items-center justify-center gap-3 min-h-[280px] group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                                <FiPlus className="text-white/40 group-hover:text-cyan-400 text-2xl" />
                            </div>
                            <p className="text-white/40 group-hover:text-white/60 font-medium">Create New Scene</p>
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="automations"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {automations.map((automation, index) => (
                            <motion.div
                                key={automation.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-6 rounded-2xl border transition-all ${automation.enabled
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-white/[0.02] border-white/5'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-opacity ${automation.enabled ? 'opacity-100' : 'opacity-40'
                                            }`}
                                        style={{ backgroundColor: `${automation.color}20` }}
                                    >
                                        {automation.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`text-lg font-semibold ${automation.enabled ? 'text-white' : 'text-white/40'
                                                }`}>
                                                {automation.name}
                                            </h3>
                                            {!automation.enabled && (
                                                <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/40">
                                                    Disabled
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm mb-4 ${automation.enabled ? 'text-white/50' : 'text-white/30'
                                            }`}>
                                            {automation.description}
                                        </p>

                                        {/* Triggers */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {automation.triggers.map((trigger) => (
                                                <div
                                                    key={trigger.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg"
                                                >
                                                    {trigger.type === 'sunset' && <FiSunset className="text-amber-400" size={14} />}
                                                    {trigger.type === 'sunrise' && <FiSunrise className="text-yellow-400" size={14} />}
                                                    {trigger.type === 'time' && <FiClock className="text-cyan-400" size={14} />}
                                                    {trigger.type === 'motion_detected' && <FiZap className="text-purple-400" size={14} />}
                                                    <span className="text-xs text-white/60 capitalize">
                                                        {trigger.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ))}
                                            <FiChevronRight className="text-white/20 self-center" size={14} />
                                            {automation.actions.slice(0, 2).map((action) => (
                                                <div
                                                    key={action.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 rounded-lg"
                                                >
                                                    <span className="text-xs text-cyan-400 capitalize">
                                                        {action.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-xs text-white/30">
                                            <span className="flex items-center gap-1">
                                                <FiZap size={12} />
                                                Triggered {automation.triggerCount} times
                                            </span>
                                            {automation.lastTriggered && (
                                                <span className="flex items-center gap-1">
                                                    <FiClock size={12} />
                                                    Last: {new Date(automation.lastTriggered).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Toggle & Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleAutomation(automation.id)}
                                            className={`p-2 rounded-lg transition-colors ${automation.enabled
                                                ? 'text-cyan-400 hover:bg-cyan-500/10'
                                                : 'text-white/30 hover:bg-white/5'
                                                }`}
                                        >
                                            {automation.enabled ? (
                                                <FiToggleRight size={28} />
                                            ) : (
                                                <FiToggleLeft size={28} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => openEditAutomationModal(automation.id)}
                                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteAutomation(automation.id)}
                                            className="p-2 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add Automation Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: automations.length * 0.05 }}
                            onClick={openCreateAutomationModal}
                            className="w-full p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-3 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                                <FiPlus className="text-white/40 group-hover:text-cyan-400" size={20} />
                            </div>
                            <p className="text-white/40 group-hover:text-white/60 font-medium">Create New Automation</p>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scene Detail Modal */}
            <AnimatePresence>
                {selectedScene && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelectedScene(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg rounded-2xl bg-[#131720] border border-white/10 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {(() => {
                                const scene = scenes.find(s => s.id === selectedScene);
                                if (!scene) return null;

                                return (
                                    <>
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                                                    style={{ backgroundColor: `${scene.color}20` }}
                                                >
                                                    {scene.icon}
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">{scene.name}</h2>
                                                    <p className="text-white/50">{scene.description}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedScene(null)}
                                                className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white"
                                            >
                                                <FiX size={20} />
                                            </button>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <h3 className="text-sm font-medium text-white/60">Actions</h3>
                                            {scene.actions.length === 0 ? (
                                                <p className="text-white/30 text-sm">No actions configured</p>
                                            ) : (
                                                scene.actions.map((action, index) => (
                                                    <div
                                                        key={action.id}
                                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-medium">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white text-sm capitalize">
                                                                {action.type.replace('_', ' ')}
                                                            </p>
                                                            <p className="text-xs text-white/40 font-mono">
                                                                {action.entityId}
                                                            </p>
                                                        </div>
                                                        {action.value !== undefined && (
                                                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
                                                                {String(action.value)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setSelectedScene(null)}
                                                className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                                            >
                                                Close
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleActivateScene(scene.id);
                                                    setSelectedScene(null);
                                                }}
                                                className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FiPlay size={18} />
                                                Activate Now
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create/Edit Scene Modal */}
            <AnimatePresence>
                {showSceneModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
                        onClick={() => setShowSceneModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl rounded-2xl bg-[#131720] border border-white/10 p-6 my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editingScene ? 'Edit Scene' : 'Create New Scene'}
                                </h2>
                                <button
                                    onClick={() => setShowSceneModal(false)}
                                    className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-white/50 mb-2">Scene Name</label>
                                        <input
                                            type="text"
                                            value={sceneForm.name}
                                            onChange={(e) => setSceneForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                            placeholder="e.g., Movie Night"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/50 mb-2">Room (Optional)</label>
                                        <select
                                            value={sceneForm.roomId}
                                            onChange={(e) => setSceneForm(prev => ({ ...prev, roomId: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none"
                                        >
                                            <option value="">All Rooms</option>
                                            {config.rooms.map(room => (
                                                <option key={room.id} value={room.id}>{room.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Description</label>
                                    <input
                                        type="text"
                                        value={sceneForm.description}
                                        onChange={(e) => setSceneForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                        placeholder="What does this scene do?"
                                    />
                                </div>

                                {/* Icon & Color */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-white/50 mb-2">Icon</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SCENE_ICONS.map(icon => (
                                                <button
                                                    key={icon}
                                                    onClick={() => setSceneForm(prev => ({ ...prev, icon }))}
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${sceneForm.icon === icon
                                                        ? 'bg-cyan-500/20 border-2 border-cyan-500'
                                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/50 mb-2">Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SCENE_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSceneForm(prev => ({ ...prev, color }))}
                                                    className={`w-10 h-10 rounded-lg transition-all ${sceneForm.color === color
                                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#131720]'
                                                        : ''
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm text-white/50">Actions</label>
                                        <button
                                            onClick={addSceneAction}
                                            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                        >
                                            <FiPlus size={14} /> Add Action
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {sceneForm.actions.length === 0 ? (
                                            <p className="text-white/30 text-sm text-center py-4 border border-dashed border-white/10 rounded-xl">
                                                No actions added. Click "Add Action" to configure what this scene does.
                                            </p>
                                        ) : (
                                            sceneForm.actions.map((action, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                                    <select
                                                        value={action.type}
                                                        onChange={(e) => updateSceneAction(index, { type: e.target.value as SceneAction['type'] })}
                                                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                                    >
                                                        {ACTION_TYPES.map(at => (
                                                            <option key={at.id} value={at.id}>{at.label}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={action.entityId}
                                                        onChange={(e) => updateSceneAction(index, { entityId: e.target.value })}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                                    >
                                                        <option value="">Select Device</option>
                                                        {allDevices.map(device => (
                                                            <option key={device.id} value={device.id}>
                                                                {device.name} ({device.room})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {(action.type === 'set_brightness' || action.type === 'set_temperature') && (
                                                        <input
                                                            type="number"
                                                            value={action.value as number || ''}
                                                            onChange={(e) => updateSceneAction(index, { value: Number(e.target.value) })}
                                                            className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                                            placeholder={action.type === 'set_brightness' ? '%' : '°F'}
                                                        />
                                                    )}
                                                    <button
                                                        onClick={() => removeSceneAction(index)}
                                                        className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowSceneModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveScene}
                                    disabled={!sceneForm.name.trim()}
                                    className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <FiCheck size={18} />
                                    {editingScene ? 'Save Changes' : 'Create Scene'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create/Edit Automation Modal */}
            <AnimatePresence>
                {showAutomationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
                        onClick={() => setShowAutomationModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl rounded-2xl bg-[#131720] border border-white/10 p-6 my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editingAutomation ? 'Edit Automation' : 'Create New Automation'}
                                </h2>
                                <button
                                    onClick={() => setShowAutomationModal(false)}
                                    className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Automation Name</label>
                                    <input
                                        type="text"
                                        value={automationForm.name}
                                        onChange={(e) => setAutomationForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                        placeholder="e.g., Sunset Lights"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Description</label>
                                    <input
                                        type="text"
                                        value={automationForm.description}
                                        onChange={(e) => setAutomationForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                        placeholder="What does this automation do?"
                                    />
                                </div>

                                {/* Icon & Color */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-white/50 mb-2">Icon</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SCENE_ICONS.map(icon => (
                                                <button
                                                    key={icon}
                                                    onClick={() => setAutomationForm(prev => ({ ...prev, icon }))}
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${automationForm.icon === icon
                                                        ? 'bg-purple-500/20 border-2 border-purple-500'
                                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/50 mb-2">Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SCENE_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setAutomationForm(prev => ({ ...prev, color }))}
                                                    className={`w-10 h-10 rounded-lg transition-all ${automationForm.color === color
                                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#131720]'
                                                        : ''
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Triggers */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm text-white/50">When (Triggers)</label>
                                        <button
                                            onClick={addAutomationTrigger}
                                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                        >
                                            <FiPlus size={14} /> Add Trigger
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {automationForm.triggers.length === 0 ? (
                                            <p className="text-white/30 text-sm text-center py-4 border border-dashed border-white/10 rounded-xl">
                                                No triggers added. Add at least one trigger for when this automation should run.
                                            </p>
                                        ) : (
                                            automationForm.triggers.map((trigger, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                                    <select
                                                        value={trigger.type}
                                                        onChange={(e) => updateAutomationTrigger(index, { type: e.target.value as AutomationTrigger['type'] })}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                                    >
                                                        {TRIGGER_TYPES.map(tt => (
                                                            <option key={tt.id} value={tt.id}>{tt.label}</option>
                                                        ))}
                                                    </select>
                                                    {trigger.type === 'time' && (
                                                        <input
                                                            type="time"
                                                            value={(trigger.config?.time as string) || ''}
                                                            onChange={(e) => updateAutomationTrigger(index, { config: { ...trigger.config, time: e.target.value } })}
                                                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                                        />
                                                    )}
                                                    {(trigger.type === 'sunrise' || trigger.type === 'sunset') && (
                                                        <input
                                                            type="number"
                                                            value={(trigger.config?.offset as number) || 0}
                                                            onChange={(e) => updateAutomationTrigger(index, { config: { ...trigger.config, offset: Number(e.target.value) } })}
                                                            className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                                            placeholder="±min"
                                                        />
                                                    )}
                                                    <button
                                                        onClick={() => removeAutomationTrigger(index)}
                                                        className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm text-white/50">Then (Actions)</label>
                                        <button
                                            onClick={addAutomationAction}
                                            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                        >
                                            <FiPlus size={14} /> Add Action
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {automationForm.actions.length === 0 ? (
                                            <p className="text-white/30 text-sm text-center py-4 border border-dashed border-white/10 rounded-xl">
                                                No actions added. Add actions to define what happens when triggered.
                                            </p>
                                        ) : (
                                            automationForm.actions.map((action, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                                    <select
                                                        value={action.type}
                                                        onChange={(e) => updateAutomationAction(index, { type: e.target.value as SceneAction['type'] })}
                                                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                                    >
                                                        {ACTION_TYPES.map(at => (
                                                            <option key={at.id} value={at.id}>{at.label}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={action.entityId}
                                                        onChange={(e) => updateAutomationAction(index, { entityId: e.target.value })}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                                    >
                                                        <option value="">Select Device</option>
                                                        {allDevices.map(device => (
                                                            <option key={device.id} value={device.id}>
                                                                {device.name} ({device.room})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {(action.type === 'set_brightness' || action.type === 'set_temperature') && (
                                                        <input
                                                            type="number"
                                                            value={action.value as number || ''}
                                                            onChange={(e) => updateAutomationAction(index, { value: Number(e.target.value) })}
                                                            className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                                                            placeholder={action.type === 'set_brightness' ? '%' : '°F'}
                                                        />
                                                    )}
                                                    <button
                                                        onClick={() => removeAutomationAction(index)}
                                                        className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowAutomationModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAutomation}
                                    disabled={!automationForm.name.trim() || automationForm.triggers.length === 0}
                                    className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <FiCheck size={18} />
                                    {editingAutomation ? 'Save Changes' : 'Create Automation'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ScenesPage;
