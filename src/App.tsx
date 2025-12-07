import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from '@/context';
import { MainLayout } from '@/components/layout';
import { HomePage, RoomView, RoomsPage, SettingsPage, CamerasPage } from '@/pages';

/**
 * Home Control Center - Premium Smart Home Dashboard
 * 
 * This application connects to Home Assistant via @hakit/core
 * For production use, wrap with <HassConnect> provider:
 * 
 * import { HassConnect } from '@hakit/core';
 * 
 * <HassConnect hassUrl="http://your-ha-instance:8123">
 *   <App />
 * </HassConnect>
 * 
 * Currently running in demo mode with mock entities.
 */
function App() {
    return (
        <AppProvider>
            {/* 
        In production with a real Home Assistant instance:
        <HassConnect hassUrl={import.meta.env.VITE_HASS_URL}>
          ...app content...
        </HassConnect>
        
        For now, we're using mock data for development
      */}
            <AnimatePresence mode="wait">
                <Routes>
                    {/* Main app with layout */}
                    <Route element={<MainLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="room/:id" element={<RoomView />} />
                        <Route path="rooms" element={<RoomsPage />} />
                        <Route path="cameras" element={<CamerasPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Routes>
            </AnimatePresence>
        </AppProvider>
    );
}

export default App;
