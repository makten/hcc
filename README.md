# Home Control Center

A premium, futuristic smart home dashboard for Home Assistant built with React, TypeScript, and Tailwind CSS.

## Features

- 🏠 **Interactive Floorplan** - SVG-based home visualization with live room status
- 🎵 **Whole-Home Audio Matrix** - Route audio sources to any zone in your home
- 🌡️ **Device Control Cards** - Beautiful glassmorphic controls for:
  - Lights (brightness, on/off)
  - Climate (circular thermostat dial)
  - Fans (speed selector)
  - Robot Vacuums (start/dock, battery status)
  - Media Players (play/pause, volume)
- ✏️ **Dashboard Editor** - Add/remove devices without touching code
- 📱 **Responsive Design** - Works on mobile, tablet (wall mount), and desktop

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **HA Integration**: @hakit/core (WebSocket, authentication, state management)
- **Styling**: Tailwind CSS with custom glassmorphism theme
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Icons**: React Icons (Feather)

## Getting Started

### Prerequisites

- Node.js 18+
- A Home Assistant instance (optional - mock mode available)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Connecting to Home Assistant

1. Copy `.env.example` to `.env.local`
2. Set `VITE_HASS_URL` to your Home Assistant URL
3. Set `VITE_MOCK_MODE=false`
4. Uncomment the `<HassConnect>` wrapper in `App.tsx`

## Project Structure

```
src/
├── components/
│   ├── devices/          # Device control cards
│   │   ├── LightCard.tsx
│   │   ├── ClimateCard.tsx
│   │   ├── FanCard.tsx
│   │   ├── VacuumCard.tsx
│   │   └── MediaCard.tsx
│   ├── floorplan/        # Interactive floorplan
│   │   └── InteractiveFloorplan.tsx
│   └── layout/           # App layout components
│       ├── MainLayout.tsx
│       ├── Navigation.tsx
│       └── MediaBar.tsx
├── features/
│   └── audio-matrix/     # Whole-home audio routing
│       └── AudioMatrix.tsx
├── pages/                # Route pages
│   ├── HomePage.tsx
│   ├── RoomView.tsx
│   ├── RoomsPage.tsx
│   └── SettingsPage.tsx
├── hooks/                # Custom React hooks
│   ├── useConfig.ts
│   └── useMockEntity.ts
├── context/              # React context providers
│   └── AppContext.tsx
├── config/               # Configuration
│   └── defaultConfig.ts
├── types/                # TypeScript types
│   └── index.ts
├── App.tsx               # Main app component
├── main.tsx              # Entry point
└── index.css             # Global styles
```

## Design Language

- **Theme**: "Dark Mode Luxury" - Deep charcoal (#121212) with glassmorphism
- **Accents**: Neon cyan (#00d4ff), purple (#a855f7), orange (#ff6b35)
- **Typography**: Inter font family
- **Effects**: Backdrop blur, subtle glows, micro-animations

## Customization

### Adding Rooms

Edit `src/config/defaultConfig.ts` or use the dashboard editor (Edit Mode).

### Custom Device Types

1. Create a new card component in `src/components/devices/`
2. Add the type to `DeviceType` in `src/types/index.ts`
3. Register in `DeviceComponentMap` in `src/pages/RoomView.tsx`

## License

MIT
