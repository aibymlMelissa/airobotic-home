# AI Matter Coordinator - Smart Home Simulator

A sophisticated AI-powered smart home simulation platform that demonstrates intelligent home automation with energy optimization, voice control, and interactive floor plan visualization.

## Features

### Core Capabilities
- **AI-Powered Home Automation**: Integration with Google Gemini 2.5 Flash for intelligent device control
- **Voice Command Control**: Speech-to-text functionality for hands-free operation
- **Interactive Floor Plan**: Visual device placement and monitoring across 6 different floor plans
- **Real-time Device Management**: Control lights, thermostats, security systems, and more
- **Energy Monitoring**: Track power consumption and cost savings
- **Simulation Console**: Real-time activity logs and system status

### Smart Devices Supported
- Lights (with brightness control)
- Thermostats (temperature management)
- Smart Plugs
- Motion Sensors
- Blinds/Shades
- Robot Vacuum
- Lawn Mower
- Pool Cleaner
- Security Systems
- Smart Locks

### Key Features

#### 1. Voice Command System
- Speech-to-text integration using Web Speech API
- Pre-made command dropdown with 20+ ready-to-use commands
- Organized by categories:
  - Temperature & Climate
  - Cleaning & Maintenance
  - Security & Safety
  - Lighting & Ambiance
  - Energy Saving
  - Routines

#### 2. Floor Plan Visualization
- 6 different floor plan layouts (Ground Floor, First Floor, Basement, Garage, Outdoor, Full House)
- Interactive device positioning via click-and-place
- Real-time device status indicators
- Visual feedback for active devices with pulse animations

#### 3. Energy Management
- Real-time energy consumption tracking
- Cost calculation based on time-of-day pricing
- Projected savings estimation
- Power usage visualization with charts

#### 4. Environmental Simulation
- Time-based automation (day/night cycles)
- Temperature simulation
- Occupancy detection
- Dynamic energy pricing

## Tech Stack

- **Frontend**: React 19.2.1 with TypeScript
- **Build Tool**: Vite 6.4.1
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI**: Google Gemini 2.5 Flash API
- **Voice**: Web Speech API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd airobotic-home
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Gemini API key:
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Enter it in the app's interface when prompted

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Usage

### Basic Commands

The app includes a dropdown menu with pre-made commands such as:
- "It's too hot in here"
- "Clean the house"
- "Secure the perimeter"
- "Good morning" (morning routine)
- "Movie mode"
- And many more...

### Voice Commands

1. Click the microphone button in the command interface
2. Speak your command clearly
3. The app will transcribe and process your request
4. Watch as the AI intelligently controls your devices

### Floor Plan Setup

1. Navigate to the "Floor Plan" tab
2. Select your desired floor plan layout
3. Click on any device from the list
4. Click on the floor plan to position the device
5. Repeat for all devices

### Device Control

- **Compact View**: Click on any device card to expand and see full details
- **Toggle Devices**: Use the power button to turn devices on/off
- **Floor Plan View**: Click devices on the floor plan for quick status

## Project Structure

```
airobotic-home/
├── components/
│   ├── ConsoleLog.tsx      # Activity log display
│   ├── DeviceCard.tsx      # Individual device cards
│   └── FloorPlanView.tsx   # Floor plan visualization
├── hooks/
│   └── useSpeechRecognition.ts  # Voice input hook
├── public/
│   └── FloorPlan/          # Floor plan images
├── services/
│   └── geminiService.ts    # AI integration
├── App.tsx                 # Main application
├── types.ts                # TypeScript definitions
├── index.tsx               # App entry point
└── index.css               # Global styles
```

## Environment Variables

For production deployment, you may want to use environment variables for your API key:

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

## Browser Compatibility

- **Voice Commands**: Requires Chrome, Edge, or Safari (Web Speech API support)
- **General Use**: Works on all modern browsers
- **Recommended**: Chrome/Edge for full feature support

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to complete deployment

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- Google Gemini AI for intelligent automation
- Lucide for beautiful icons
- Tailwind CSS for styling
- The React team for the amazing framework

## Support

For issues and questions, please open an issue on GitHub.

---

**Version**: 1.2.0
**Status**: Production Ready
**Last Updated**: December 2025
