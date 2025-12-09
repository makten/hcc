import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiZap,
    FiTrendingUp,
    FiTrendingDown,
    FiTarget,
    FiClock,
    FiDollarSign,
    FiRefreshCw,
    FiSettings,
    FiChevronRight,
    FiX,
    FiPlus,
    FiCheck,
    FiTrash2,
    FiEdit2
} from 'react-icons/fi';
import { useEnergy } from '@/context';
import { EnergyGoal } from '@/types';

type TimeRange = 'hourly' | 'daily' | 'weekly';

export function EnergyPage() {
    const { state, refreshData, addGoal, updateGoal, removeGoal, updateTariff } = useEnergy();
    const [timeRange, setTimeRange] = useState<TimeRange>('daily');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<string | null>(null);

    // Goal form state
    const [goalForm, setGoalForm] = useState({
        type: 'monthly' as EnergyGoal['type'],
        target: 600,
        alertThreshold: 80,
    });

    // Settings form state
    const [settingsForm, setSettingsForm] = useState({
        rate: state.tariff.rate,
        currency: state.tariff.currency,
        provider: state.tariff.provider || '',
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        refreshData();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const formatPower = (watts: number) => {
        if (watts >= 1000) {
            return `${(watts / 1000).toFixed(2)} kW`;
        }
        return `${Math.round(watts)} W`;
    };

    const getHistoryData = () => {
        switch (timeRange) {
            case 'hourly':
                return state.history.hourly;
            case 'daily':
                return state.history.daily;
            case 'weekly':
                return state.history.weekly;
        }
    };

    const openCreateGoalModal = () => {
        setGoalForm({
            type: 'monthly',
            target: 600,
            alertThreshold: 80,
        });
        setEditingGoal(null);
        setShowGoalModal(true);
    };

    const openEditGoalModal = (goalId: string) => {
        const goal = state.goals.find(g => g.id === goalId);
        if (goal) {
            setGoalForm({
                type: goal.type,
                target: goal.target,
                alertThreshold: goal.alertThreshold || 80,
            });
            setEditingGoal(goalId);
            setShowGoalModal(true);
        }
    };

    const handleSaveGoal = () => {
        const now = new Date();
        const startDate = goalForm.type === 'monthly'
            ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            : goalForm.type === 'weekly'
                ? new Date(now.setDate(now.getDate() - now.getDay())).toISOString()
                : now.toISOString();

        if (editingGoal) {
            updateGoal(editingGoal, {
                type: goalForm.type,
                target: goalForm.target,
                alertThreshold: goalForm.alertThreshold,
            });
        } else {
            addGoal({
                type: goalForm.type,
                target: goalForm.target,
                current: 0,
                startDate,
                alertThreshold: goalForm.alertThreshold,
            });
        }
        setShowGoalModal(false);
    };

    const handleSaveSettings = () => {
        updateTariff({
            rate: settingsForm.rate,
            currency: settingsForm.currency,
            provider: settingsForm.provider || undefined,
        });
        setShowSettingsModal(false);
    };

    const openSettingsModal = () => {
        setSettingsForm({
            rate: state.tariff.rate,
            currency: state.tariff.currency,
            provider: state.tariff.provider || '',
        });
        setShowSettingsModal(true);
    };

    const historyData = getHistoryData();
    const maxValue = Math.max(...historyData.map(d => d.value));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Energy Dashboard</h1>
                    <p className="text-white/50">Monitor and optimize your energy usage</p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRefresh}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} size={20} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openSettingsModal}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <FiSettings size={20} />
                    </motion.button>
                </div>
            </div>

            {/* Current Power & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Current Power */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-1 md:col-span-2 lg:col-span-1 p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                            <FiZap className="text-cyan-400" size={20} />
                        </div>
                        <span className="text-white/60 text-sm">Current Power</span>
                    </div>
                    <p className="text-4xl font-bold text-white mb-2">
                        {formatPower(state.currentPower)}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        {state.comparisonToYesterday && state.comparisonToYesterday < 0 ? (
                            <>
                                <FiTrendingDown className="text-green-400" />
                                <span className="text-green-400">{Math.abs(state.comparisonToYesterday)}% from yesterday</span>
                            </>
                        ) : (
                            <>
                                <FiTrendingUp className="text-red-400" />
                                <span className="text-red-400">+{state.comparisonToYesterday}% from yesterday</span>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Today Usage */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <FiClock className="text-amber-400" size={20} />
                        </div>
                        <span className="text-white/60 text-sm">Today</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{state.todayUsage.toFixed(1)} kWh</p>
                    <p className="text-xs text-white/40">Peak at {state.peakUsageTime}</p>
                </motion.div>

                {/* Monthly Usage */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <FiTarget className="text-purple-400" size={20} />
                        </div>
                        <span className="text-white/60 text-sm">This Month</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{state.monthUsage.toFixed(1)} kWh</p>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((state.monthUsage / (state.goals[0]?.target || 600)) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                        {((state.monthUsage / (state.goals[0]?.target || 600)) * 100).toFixed(0)}% of goal
                    </p>
                </motion.div>

                {/* Estimated Cost */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <FiDollarSign className="text-green-400" size={20} />
                        </div>
                        <span className="text-white/60 text-sm">Est. Monthly Cost</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {state.tariff.currency}{state.estimatedMonthlyCost.toFixed(2)}
                    </p>
                    <p className="text-xs text-white/40">
                        @ {state.tariff.currency}{state.tariff.rate}/kWh
                    </p>
                </motion.div>
            </div>

            {/* Energy Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Usage History</h2>
                    <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
                        {(['hourly', 'daily', 'weekly'] as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${timeRange === range
                                    ? 'bg-cyan-500 text-white'
                                    : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Simple bar chart */}
                <div className="h-64 flex items-end gap-1">
                    {historyData.map((point, index) => {
                        const height = (point.value / maxValue) * 100;
                        return (
                            <motion.div
                                key={index}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: index * 0.02 }}
                                className="flex-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t-sm hover:from-cyan-400 hover:to-purple-400 cursor-pointer transition-colors group relative"
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1a1f2e] rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {point.value.toFixed(1)} kWh
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/40">
                    <span>{timeRange === 'hourly' ? '24h ago' : timeRange === 'daily' ? '30 days ago' : '12 weeks ago'}</span>
                    <span>Now</span>
                </div>
            </motion.div>

            {/* Categories Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Category */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">By Category</h2>
                    <div className="space-y-4">
                        {state.byCategory.map((cat, index) => (
                            <div key={cat.category}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white/70">{cat.category}</span>
                                    <span className="text-white font-medium">{cat.value.toFixed(1)} kWh</span>
                                </div>
                                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.percentage}%` }}
                                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Energy Goals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Energy Goals</h2>
                        <button
                            onClick={openCreateGoalModal}
                            className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
                        >
                            <FiPlus size={14} /> Add Goal
                        </button>
                    </div>
                    <div className="space-y-4">
                        {state.goals.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                <FiTarget className="mx-auto text-white/20 mb-2" size={32} />
                                <p className="text-white/40 text-sm">No energy goals set</p>
                                <button
                                    onClick={openCreateGoalModal}
                                    className="text-cyan-400 text-sm mt-2 hover:underline"
                                >
                                    Create your first goal
                                </button>
                            </div>
                        ) : (
                            state.goals.map((goal) => {
                                const progress = (goal.current / goal.target) * 100;
                                const isOnTrack = progress < (goal.alertThreshold || 85);

                                return (
                                    <div
                                        key={goal.id}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-white font-medium capitalize">{goal.type} Goal</p>
                                                <p className="text-xs text-white/40">Target: {goal.target} kWh</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isOnTrack
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                    {isOnTrack ? 'On Track' : 'At Risk'}
                                                </div>
                                                <button
                                                    onClick={() => openEditGoalModal(goal.id)}
                                                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all"
                                                >
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => removeGoal(goal.id)}
                                                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                                    className={`h-full rounded-full ${progress < 70 ? 'bg-green-500' :
                                                        progress < 90 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2 text-xs">
                                                <span className="text-white/60">{goal.current.toFixed(1)} kWh used</span>
                                                <span className="text-white/40">{(goal.target - goal.current).toFixed(1)} kWh remaining</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Tips Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20"
            >
                <h2 className="text-lg font-semibold text-white mb-4">💡 Energy Saving Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { tip: 'HVAC accounts for 42% of your usage. Consider scheduling during off-peak hours.', saving: '$12/mo' },
                        { tip: 'Your peak usage is at 6 PM. Shifting appliances to morning could save energy.', saving: '$8/mo' },
                        { tip: 'Enable smart thermostat scheduling for automatic optimization.', saving: '$15/mo' },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-colors cursor-pointer group"
                        >
                            <p className="text-white/70 text-sm mb-3">{item.tip}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-green-400 font-medium">Save {item.saving}</span>
                                <FiChevronRight className="text-white/30 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Goal Modal */}
            <AnimatePresence>
                {showGoalModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowGoalModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md rounded-2xl bg-[#131720] border border-white/10 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editingGoal ? 'Edit Goal' : 'Create Energy Goal'}
                                </h2>
                                <button
                                    onClick={() => setShowGoalModal(false)}
                                    className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Goal Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setGoalForm(prev => ({ ...prev, type }))}
                                                className={`px-4 py-3 rounded-xl border transition-all capitalize ${goalForm.type === type
                                                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                                                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Target (kWh)</label>
                                    <input
                                        type="number"
                                        value={goalForm.target}
                                        onChange={(e) => setGoalForm(prev => ({ ...prev, target: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none"
                                        min={1}
                                    />
                                    <p className="text-xs text-white/30 mt-1">
                                        Recommended: {goalForm.type === 'daily' ? '20-40' : goalForm.type === 'weekly' ? '150-250' : '500-800'} kWh
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Alert Threshold (%)</label>
                                    <input
                                        type="range"
                                        value={goalForm.alertThreshold}
                                        onChange={(e) => setGoalForm(prev => ({ ...prev, alertThreshold: Number(e.target.value) }))}
                                        className="w-full"
                                        min={50}
                                        max={100}
                                    />
                                    <div className="flex justify-between text-xs text-white/40 mt-1">
                                        <span>Alert at {goalForm.alertThreshold}% of goal</span>
                                        <span>{Math.round(goalForm.target * goalForm.alertThreshold / 100)} kWh</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowGoalModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveGoal}
                                    className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiCheck size={18} />
                                    {editingGoal ? 'Save Changes' : 'Create Goal'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettingsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowSettingsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md rounded-2xl bg-[#131720] border border-white/10 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Energy Settings</h2>
                                <button
                                    onClick={() => setShowSettingsModal(false)}
                                    className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Electricity Rate (per kWh)</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={settingsForm.currency}
                                            onChange={(e) => setSettingsForm(prev => ({ ...prev, currency: e.target.value }))}
                                            className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                                        >
                                            <option value="$">$ USD</option>
                                            <option value="€">€ EUR</option>
                                            <option value="£">£ GBP</option>
                                        </select>
                                        <input
                                            type="number"
                                            value={settingsForm.rate}
                                            onChange={(e) => setSettingsForm(prev => ({ ...prev, rate: Number(e.target.value) }))}
                                            step={0.01}
                                            min={0}
                                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Energy Provider (Optional)</label>
                                    <input
                                        type="text"
                                        value={settingsForm.provider}
                                        onChange={(e) => setSettingsForm(prev => ({ ...prev, provider: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                        placeholder="e.g., Pacific Gas & Electric"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowSettingsModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveSettings}
                                    className="flex-1 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiCheck size={18} />
                                    Save Settings
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default EnergyPage;
