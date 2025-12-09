/**
 * Home Assistant API Service
 * Provides methods to interact with the Home Assistant REST API
 * 
 * Note: Due to CORS restrictions in browsers, direct calls to Home Assistant
 * from a different origin may be blocked. This service provides options for:
 * 1. Using a proxy (configured in nginx for production)
 * 2. Direct calls (when Home Assistant is configured to allow CORS)
 */

export interface HassApiConfig {
    url: string;
    accessToken: string;
    useProxy?: boolean; // If true, use local proxy to avoid CORS
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
    private useProxy: boolean = true;  // Default to true - use proxy before configure() is called

    /**
     * Configure the API with Home Assistant URL and access token
     */
    configure(config: HassApiConfig) {
        // Remove trailing slash if present
        this.baseUrl = config.url.replace(/\/$/, '');
        this.accessToken = config.accessToken;
        this.useProxy = config.useProxy ?? true;
    }

    /**
     * Check if the API is properly configured with credentials
     */
    isConfigured(): boolean {
        return Boolean(this.accessToken && this.accessToken.length > 0);
    }

    /**
     * Get the effective URL (proxied or direct)
     */
    private getEffectiveUrl(endpoint: string): string {
        if (this.useProxy) {
            // Use local proxy endpoint
            return `/api/hass${endpoint}`;
        }
        return `${this.baseUrl}/api${endpoint}`;
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

            // Try direct connection first
            const response = await fetch(`${this.baseUrl}/api/`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: controller.signal,
                mode: 'cors', // Explicitly request CORS
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
            console.error('Home Assistant connection error:', error);

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    return { success: false, error: 'Connection timeout - check URL and network' };
                }

                // CORS errors and network errors both throw TypeError in fetch
                if (error.name === 'TypeError') {
                    return {
                        success: false,
                        error: 'Cannot connect - CORS blocked or network error. Try adding this to your Home Assistant configuration.yaml:\n\nhttp:\n  cors_allowed_origins:\n    - "*"'
                    };
                }

                return { success: false, error: error.message };
            }
            return { success: false, error: 'Unknown error occurred' };
        }
    }

    /**
     * Safely parse JSON response, with better error handling for HTML responses
     */
    private async parseJsonResponse<T>(response: Response, context: string): Promise<T> {
        const contentType = response.headers.get('content-type');

        // Check if response is JSON
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();

            // Check if it's an HTML response (common when proxy fails)
            if (text.trim().startsWith('<') || text.trim().startsWith('<!DOCTYPE')) {
                console.error(`[${context}] Received HTML instead of JSON. This usually means:`);
                console.error('  1. The Home Assistant URL is incorrect');
                console.error('  2. Home Assistant is not reachable');
                console.error('  3. The Vite proxy is not properly configured');
                console.error('Response preview:', text.substring(0, 200));
                throw new Error(`Received HTML instead of JSON - check Home Assistant URL and connectivity`);
            }

            // Try to parse as JSON anyway (some servers don't set content-type correctly)
            try {
                return JSON.parse(text) as T;
            } catch {
                throw new Error(`Invalid response format: ${text.substring(0, 100)}`);
            }
        }

        return response.json() as Promise<T>;
    }

    /**
     * Get all entity states
     */
    async getStates(): Promise<HassState[]> {
        // Don't make API calls if not configured
        if (!this.isConfigured()) {
            return [];
        }

        try {
            const url = this.getEffectiveUrl('/states');
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                // 401 is expected when token is invalid/missing - not an error to log loudly
                if (response.status === 401) {
                    console.debug('[getStates] Authentication failed (401) - check access token');
                    return [];
                }
                // Check if the response is HTML (indicates proxy/server issue)
                const contentType = response.headers.get('content-type');
                if (contentType?.includes('text/html')) {
                    console.error('[getStates] Received HTML error page. Proxy may not be reaching Home Assistant.');
                    throw new Error(`Proxy error: Cannot reach Home Assistant at ${this.baseUrl}`);
                }
                throw new Error(`Failed to get states: ${response.status}`);
            }

            return await this.parseJsonResponse<HassState[]>(response, 'getStates');
        } catch (error) {
            console.error('Error getting states:', error);
            return [];
        }
    }

    /**
     * Get state of a specific entity
     */
    async getState(entityId: string): Promise<HassState | null> {
        if (!this.isConfigured()) {
            return null;
        }

        try {
            const response = await fetch(this.getEffectiveUrl(`/states/${entityId}`), {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                return null;
            }

            return await this.parseJsonResponse<HassState>(response, 'getState');
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

            const response = await fetch(this.getEffectiveUrl(`/services/${domain}/${service}`), {
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
            const response = await fetch(this.getEffectiveUrl('/config'), {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                return null;
            }

            return await this.parseJsonResponse<HassConfig>(response, 'getConfig');
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
