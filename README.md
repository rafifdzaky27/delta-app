# 🛵 DELTA - Personal Commute Tracker

> *Track your daily commute and discover your personal patterns. No racing, just rhythm.*

## 🎯 About DELTA

DELTA is a minimalist, personal commute tracker that helps users log, compare, and reflect on their daily trips. Built for urban solo commuters using scooters, cars, or bikes, DELTA focuses on **you vs you** tracking rather than social competition.

## ✨ Key Features

- **Automatic Trip Detection** - Smart geofence and movement-based trip detection
- **Real-time GPS Tracking** - Precise route recording with sector timing
- **Privacy-First Design** - All data stored locally on your device
- **Delta Comparisons** - See how today compares to yesterday, your average, and your best times
- **Route Management** - Create and manage your daily commute routes
- **Background Tracking** - Seamless tracking without manual start/stop

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with geolocation support

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd commute-rhythm-delta

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Copy `.env.example` to `.env` and configure your settings:

```bash
# Core tracking settings
VITE_GEOFENCE_RADIUS=100           # Detection radius in meters
VITE_MIN_SPEED_THRESHOLD=5         # Minimum speed to detect movement
VITE_TRIP_MIN_DURATION=120000      # Minimum trip length (2 minutes)
VITE_IDLE_TIMEOUT=300000           # Auto-end trip after idle time

# Development
VITE_ENABLE_DEBUG_MODE=true        # Shows detailed console logs
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # Core business logic
├── types/              # TypeScript type definitions
├── lib/                # Utilities and configuration
└── pages/              # Main application pages
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```bash
VITE_APP_NAME=DELTA
VITE_GEOFENCE_RADIUS=100
VITE_MIN_SPEED_THRESHOLD=5
VITE_TRIP_MIN_DURATION=120000
VITE_IDLE_TIMEOUT=300000
VITE_ENABLE_DEBUG_MODE=false
```

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Build Tool**: Vite
- **State Management**: React Hooks, TanStack Query
- **Storage**: Browser LocalStorage
- **Geolocation**: Web Geolocation API

## 🔒 Privacy & Security

- **Local-First**: All data stored in browser localStorage
- **No External APIs**: No user data transmitted to external servers
- **Permission-Based**: Requires explicit user consent for location access
- **Data Control**: Users can export or clear their data anytime

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with geolocation support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Roadmap

### Phase 2 (Upcoming)
- [ ] Interactive map visualization
- [ ] Enhanced trip analytics
- [ ] Sector-based route optimization
- [ ] Push notifications
- [ ] Data export/import

### Phase 3 (Future)
- [ ] Progressive Web App (PWA)
- [ ] Offline functionality
- [ ] Advanced statistics
- [ ] Route sharing (optional)

---

**DELTA** - *Understanding your commute, one ride at a time.*
