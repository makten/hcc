import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, AuthProvider, NotificationProvider, EnergyProvider, ScenesProvider } from '@/context';
import { MainLayout } from '@/components/layout';
import {
    HomePage,
    RoomView,
    RoomsPage,
    SettingsPage,
    CamerasPage,
    LoginPage,
    EnergyPage,
    ScenesPage,
    NotificationsPage,
    UserManagementPage
} from '@/pages';

/**
 * Home Control Center - Premium Smart Home Dashboard
 * 
 * A commercial-grade home automation system with:
 * - Multi-user authentication with role-based access
 * - Notification center and event logging
 * - Energy management dashboard
 * - Scenes and automations
 * - Room-by-room control
 * - Camera monitoring
 * 
 * Integrates with Home Assistant for device control.
 */
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Check if user has an active session
        const session = localStorage.getItem('hcc-session');
        return !!session;
    });

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('hcc-session');
        localStorage.removeItem('hcc-current-user');
    };

    return (
        <AuthProvider>
            <NotificationProvider>
                <EnergyProvider>
                    <ScenesProvider>
                        <AppProvider>
                            <AnimatePresence mode="wait">
                                {!isAuthenticated ? (
                                    <LoginPage key="login" onLogin={handleLogin} />
                                ) : (
                                    <Routes key="app">
                                        {/* Main app with layout */}
                                        <Route element={<MainLayout onLogout={handleLogout} />}>
                                            <Route index element={<HomePage />} />
                                            <Route path="room/:id" element={<RoomView />} />
                                            <Route path="rooms" element={<RoomsPage />} />
                                            <Route path="cameras" element={<CamerasPage />} />
                                            <Route path="energy" element={<EnergyPage />} />
                                            <Route path="scenes" element={<ScenesPage />} />
                                            <Route path="notifications" element={<NotificationsPage />} />
                                            <Route path="users" element={<UserManagementPage />} />
                                            <Route path="settings" element={<SettingsPage />} />
                                        </Route>
                                    </Routes>
                                )}
                            </AnimatePresence>
                        </AppProvider>
                    </ScenesProvider>
                </EnergyProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
