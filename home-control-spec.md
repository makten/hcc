# Role & Objective
You are a Senior Frontend Architect and UX Designer specializing in IoT and Smart Home interfaces. Your task is to design and scaffold a standalone, premium React Single Page Application (SPA) that functions as a dashboard for Home Assistant.

# Technical Stack & Constraints (Strict)
1.  *Core Framework:* React (Vite-based), TypeScript.
2.  *HA Communication:* You MUST use @hakit/core for all WebSocket connections, authentication, state management, and hooks (useEntity, useService, useHass). Do not write manual WebSocket logic.
3.  *UI Components:* Use @hakit/components as the base, but extend them using *Tailwind CSS* for layout and styling to achieve a specific "Glassmorphism" aesthetic.
4.  *Routing:* react-router-dom (v6+).
5.  *Animations:* framer-motion for page transitions and micro-interactions.
6.  *Icons:* react-icons (Feather or Material Design Rounded).

# Design Language (UX/UI)
The application must feel "futuristic, premium, and silky smooth."
* *Theme:* "Dark Mode Luxury." Deep charcoal backgrounds (#121212), blurred semi-transparent cards (glassmorphism), and subtle neon accents for active states.
* *Responsiveness:*
    * *Mobile:* Single-column, thumb-friendly bottom navigation.
    * *Tablet (Wall Mount):* The primary view. Grid-based, high information density but uncluttered.
    * *Desktop:* Wide layout, visualizes all rooms simultaneously or uses a sidebar layout.

# Key Feature Requirements

## 1. The Interactive Floorplan (Home Route /)
Instead of a standard grid, the main view is a stylized 2D SVG floorplan of the house.
* *Interaction:* Clicking a room area navigates to that room's detail page.
* *Visual Feedback:* The room polygon must visually react to state.
    * Light Status: If any light in the room is ON, the room area glows yellow/white.
    * Media Status: If music is playing in that room, a small equalizer animation appears over the room.

## 2. Whole-Home Audio Matrix (Global Feature)
The house uses a multi-zone audio system.
* *Global Bar:* A persistent media bar at the bottom of the screen showing the currently active master zone.
* *The Matrix UI:* Create a specialized modal or drawer called "Audio Routing."
    * *Left Column:* Audio Sources (e.g., Spotify, Apple TV, Turntable).
    * *Right Column:* Output Zones (e.g., Living Room, Patio, Kitchen).
    * *Functionality:* Allow the user to select a source and toggle which zones are active for that source (grouping/ungrouping). Use useService to call Home Assistant media_player.join or media_player.select_source services.

## 3. Dynamic Room Pages (/room/:id)
Create a dynamic routing structure where a generic RoomLayout component renders specific devices based on the room ID.
* *Device Cards Needed:*
    * *Climate:* Circular thermostat dial (adjust temp, set Hvac mode).
    * *Lights:* A master toggle for the room + individual sliders for specific entities.
    * *Fans:* Speed selector (Off/Low/Med/High).
    * *Robot Vacuum:* Status text, battery ring, and "Start/Dock" actions.
    * *Media:* Local volume slider and Play/Pause for that specific room's speakers.

## 4. Dashboard Editor (Client-Side Config)
Allow users to "Manage" the dashboard without touching code.
* Implement a "Edit Mode" toggle.
* When active, display "Add Device" / "Remove Device" buttons on room pages.
* Persist this configuration (which devices belong to which room) in localStorage or a JSON config file so the dashboard is customizable.

# Deliverables

1.  *Project Structure:* A tree view of the recommended folder structure (e.g., src/features/audio-matrix, src/components/floorplan, src/hooks).
2.  **App Entry (App.tsx):** Show how to wrap the app with the <HassConnect /> provider from @hakit/core.
3.  **Component Code - AudioMatrix.tsx:** Write the React code for the complex audio routing component using dummy data for sources/zones but real useService hooks for the logic.
4.  **Component Code - RoomView.tsx:** A sample implementation of a room page that fetches entities based on a config object and renders the appropriate cards.