// Energy consumption data point
export interface EnergyDataPoint {
    timestamp: string;
    value: number; // kWh
}

// Energy consumption by category
export interface EnergyByCategory {
    category: string;
    value: number;
    percentage: number;
    color: string;
}

// Device energy consumption
export interface DeviceEnergyUsage {
    deviceId: string;
    deviceName: string;
    entityId: string;
    roomId: string;
    roomName: string;
    currentPower: number; // Watts
    todayUsage: number; // kWh
    monthUsage: number; // kWh
    estimatedMonthlyCost: number;
}

// Room energy summary
export interface RoomEnergySummary {
    roomId: string;
    roomName: string;
    color: string;
    currentPower: number;
    todayUsage: number;
    monthUsage: number;
    deviceCount: number;
}

// Energy tariff configuration
export interface EnergyTariff {
    id: string;
    name: string;
    rate: number; // Cost per kWh
    currency: string;
    peakHours?: { start: number; end: number }; // 24h format
    peakRate?: number;
    provider?: string; // Energy provider name
}

// Energy goal
export interface EnergyGoal {
    id: string;
    type: 'daily' | 'weekly' | 'monthly';
    target: number; // kWh
    current: number;
    startDate: string;
    alertThreshold?: number; // Percentage at which to alert
}

// Energy dashboard state
export interface EnergyDashboardState {
    currentPower: number; // Total current draw in Watts
    todayUsage: number;
    weekUsage: number;
    monthUsage: number;
    estimatedMonthlyCost: number;
    tariff: EnergyTariff;
    byCategory: EnergyByCategory[];
    byRoom: RoomEnergySummary[];
    byDevice: DeviceEnergyUsage[];
    history: {
        hourly: EnergyDataPoint[];
        daily: EnergyDataPoint[];
        weekly: EnergyDataPoint[];
    };
    goals: EnergyGoal[];
    peakUsageTime?: string;
    comparisonToYesterday?: number; // Percentage
    comparisonToLastWeek?: number;
}

// Default tariff
export const DEFAULT_TARIFF: EnergyTariff = {
    id: 'default',
    name: 'Standard Rate',
    rate: 0.12,
    currency: 'USD',
};
