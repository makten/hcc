import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
    EnergyDashboardState,
    EnergyDataPoint,
    EnergyTariff,
    EnergyGoal,
    DEFAULT_TARIFF
} from '@/types';

const STORAGE_KEY = 'hcc-energy';

// Generate mock data for demonstration
const generateMockHourlyData = (): EnergyDataPoint[] => {
    const data: EnergyDataPoint[] = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
        const time = new Date(now);
        time.setHours(now.getHours() - i);
        data.push({
            timestamp: time.toISOString(),
            value: Math.random() * 2 + 0.5,
        });
    }
    return data;
};

const generateMockDailyData = (): EnergyDataPoint[] => {
    const data: EnergyDataPoint[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const time = new Date(now);
        time.setDate(now.getDate() - i);
        data.push({
            timestamp: time.toISOString(),
            value: Math.random() * 30 + 15,
        });
    }
    return data;
};

const generateMockWeeklyData = (): EnergyDataPoint[] => {
    const data: EnergyDataPoint[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
        const time = new Date(now);
        time.setDate(now.getDate() - (i * 7));
        data.push({
            timestamp: time.toISOString(),
            value: Math.random() * 150 + 100,
        });
    }
    return data;
};

const initialState: EnergyDashboardState = {
    currentPower: 1247,
    todayUsage: 18.4,
    weekUsage: 142.7,
    monthUsage: 589.3,
    estimatedMonthlyCost: 70.72,
    tariff: DEFAULT_TARIFF,
    byCategory: [
        { category: 'HVAC', value: 245.2, percentage: 41.6, color: '#06b6d4' },
        { category: 'Lighting', value: 88.4, percentage: 15.0, color: '#fbbf24' },
        { category: 'Appliances', value: 147.3, percentage: 25.0, color: '#a855f7' },
        { category: 'Electronics', value: 76.8, percentage: 13.0, color: '#00ff88' },
        { category: 'Other', value: 31.6, percentage: 5.4, color: '#6b7280' },
    ],
    byRoom: [],
    byDevice: [],
    history: {
        hourly: generateMockHourlyData(),
        daily: generateMockDailyData(),
        weekly: generateMockWeeklyData(),
    },
    goals: [
        {
            id: 'monthly-goal',
            type: 'monthly',
            target: 600,
            current: 589.3,
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        },
    ],
    peakUsageTime: '18:00',
    comparisonToYesterday: -5.2,
    comparisonToLastWeek: 2.8,
};

interface EnergyContextType {
    state: EnergyDashboardState;
    updateTariff: (updates: Partial<EnergyTariff>) => void;
    addGoal: (goal: Omit<EnergyGoal, 'id'>) => void;
    updateGoal: (id: string, updates: Partial<EnergyGoal>) => void;
    removeGoal: (id: string) => void;
    refreshData: () => void;
}

const EnergyContext = createContext<EnergyContextType | undefined>(undefined);

const generateId = () => `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function EnergyProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<EnergyDashboardState>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return {
                    ...parsed,
                    history: {
                        hourly: generateMockHourlyData(),
                        daily: generateMockDailyData(),
                        weekly: generateMockWeeklyData(),
                    },
                };
            } catch {
                return initialState;
            }
        }
        return initialState;
    });

    useEffect(() => {
        const { history, ...stateWithoutHistory } = state;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithoutHistory));
    }, [state]);

    useEffect(() => {
        const interval = setInterval(() => {
            setState(prev => ({
                ...prev,
                currentPower: prev.currentPower + (Math.random() - 0.5) * 100,
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const updateTariff = useCallback((updates: Partial<EnergyTariff>) => {
        setState(prev => {
            const tariff = { ...prev.tariff, ...updates };
            const estimatedMonthlyCost = prev.monthUsage * tariff.rate;
            return {
                ...prev,
                tariff,
                estimatedMonthlyCost,
            };
        });
    }, []);

    const addGoal = useCallback((goal: Omit<EnergyGoal, 'id'>) => {
        const newGoal: EnergyGoal = {
            ...goal,
            id: generateId(),
        };

        setState(prev => ({
            ...prev,
            goals: [...prev.goals, newGoal],
        }));
    }, []);

    const updateGoal = useCallback((id: string, updates: Partial<EnergyGoal>) => {
        setState(prev => ({
            ...prev,
            goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g),
        }));
    }, []);

    const removeGoal = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            goals: prev.goals.filter(g => g.id !== id),
        }));
    }, []);

    const refreshData = useCallback(() => {
        setState(prev => ({
            ...prev,
            history: {
                hourly: generateMockHourlyData(),
                daily: generateMockDailyData(),
                weekly: generateMockWeeklyData(),
            },
            currentPower: Math.random() * 1500 + 500,
        }));
    }, []);

    return (
        <EnergyContext.Provider
            value={{
                state,
                updateTariff,
                addGoal,
                updateGoal,
                removeGoal,
                refreshData,
            }}
        >
            {children}
        </EnergyContext.Provider>
    );
}

export function useEnergy() {
    const context = useContext(EnergyContext);
    if (context === undefined) {
        throw new Error('useEnergy must be used within an EnergyProvider');
    }
    return context;
}
