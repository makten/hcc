/**
 * Home Assistant API Service
 * Provides methods to interact with the Home Assistant REST API
 */

export interface HassApiConfig {
    url: string;
    accessToken: string;
}

export interface HassState {
    entity_id: string;
    state: string;
    attributes: Record<string, unknown>;
    last_changed: string;
    last_updated: string;
}

export interface HassConfig {
    location_name: string;
    version: string;
    state: string;
}

export interface HassServiceResponse {
    success: boolean;
    error?: string;
}

class HomeAssistantApi {
    private baseUrl: string = '';
    private accessToken: string = '';

    /**
     * Configure the API with Home Assistant URL and access token
     */
    configure(config: HassApiConfig) {
        // Remove trailing slash if present
        this.baseUrl = config.url.replace(/\/$/, '');
        this.accessToken = config.accessToken;
    }

    /**
     * Get headers for API requests
     */
    private getHeaders(): HeadersInit {
        return {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Test connection to Home Assistant
     * Returns true if connection is successful, false otherwise
     */
    async testConnection(): Promise<{ success: boolean; error?: string; version?: string }> {
        if (!this.baseUrl) {
            return { success: false, error: 'No Home Assistant URL configured' };
        }

        if (!this.accessToken) {
            return { success: false, error: 'No access token configured' };
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(`${this.baseUrl}/api/`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 401) {
                    return { success: false, error: 'Invalid access token' };
                }
                if (response.status === 403) {
                    return { success: false, error: 'Access forbidden - check token permissions' };
                }
                return { success: false, error: `Connection failed: ${response.status} ${response.statusText}` };
            }

            const data = await response.json();
            return { success: true, version: data.version };

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    return { success: false, error: 'Connection timeout - check URL and network' };
                }
                if (error.message.includes('fetch') || error.message.includes('network')) {
                    return { success: false, error: 'Cannot reach Home Assistant - check URL' };
                }
                return { success: false, error: error.message };
            }
            return { success: false, error: 'Unknown error occurred' };
        }
    }

    /**
     * Get all entity states
     */
    async getStates(): Promise<HassState[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/states`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to get states: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting states:', error);
            return [];
        }
    }

    /**
     * Get state of a specific entity
     */
    async getState(entityId: string): Promise<HassState | null> {
        try {
            const response = await fetch(`${this.baseUrl}/api/states/${entityId}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`Error getting state for ${entityId}:`, error);
            return null;
        }
    }

    /**
     * Call a Home Assistant service
     */
    async callService(
        domain: string,
        service: string,
        entityId?: string,
        serviceData?: Record<string, unknown>
    ): Promise<HassServiceResponse> {
        try {
            const data: Record<string, unknown> = { ...serviceData };
            if (entityId) {
                data.entity_id = entityId;
            }

            const response = await fetch(`${this.baseUrl}/api/services/${domain}/${service}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                return { success: false, error: `Service call failed: ${response.status}` };
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Turn on an entity
     */
    async turnOn(entityId: string, options?: Record<string, unknown>): Promise<HassServiceResponse> {
        const domain = entityId.split('.')[0];
        return this.callService(domain, 'turn_on', entityId, options);
    }

    /**
     * Turn off an entity
     */
    async turnOff(entityId: string): Promise<HassServiceResponse> {
        const domain = entityId.split('.')[0];
        return this.callService(domain, 'turn_off', entityId);
    }

    /**
     * Toggle an entity
     */
    async toggle(entityId: string): Promise<HassServiceResponse> {
        const domain = entityId.split('.')[0];
        return this.callService(domain, 'toggle', entityId);
    }

    /**
     * Set light brightness (0-255)
     */
    async setLightBrightness(entityId: string, brightness: number): Promise<HassServiceResponse> {
        return this.callService('light', 'turn_on', entityId, { brightness });
    }

    /**
     * Set climate temperature
     */
    async setClimateTemperature(entityId: string, temperature: number): Promise<HassServiceResponse> {
        return this.callService('climate', 'set_temperature', entityId, { temperature });
    }

    /**
     * Get Home Assistant configuration
     */
    async getConfig(): Promise<HassConfig | null> {
        try {
            const response = await fetch(`${this.baseUrl}/api/config`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting config:', error);
            return null;
        }
    }

    /**
     * Discover all entities of a specific domain
     */
    async discoverEntities(domain?: string): Promise<HassState[]> {
        const states = await this.getStates();
        if (domain) {
            return states.filter(state => state.entity_id.startsWith(`${domain}.`));
        }
        return states;
    }
}

// Export singleton instance
export const hassApi = new HomeAssistantApi();
export default hassApi;
