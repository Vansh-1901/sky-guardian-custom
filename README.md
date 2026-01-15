# Sky Guardian Swarm

Sky Guardian Swarm is a tactical drone swarm command and control interface designed to simulate and manage autonomous drone operations. This dashboard provides real-time situational awareness, fleet status monitoring, and insight into the AI decision-making process of the swarm.

## 🚀 Key Features

### 🎮 Mission Control
- **Operational Controls**: Start, pause, and reset missions.
- **Scenario Injection**: Toggle environmental factors like GPS availability and Enemy Jamming to test swarm resilience.
- **Live Status**: Real-time feedback on mission state (Running/Paused) and active threats.

### 🚁 Swarm Roster
- **Fleet Management**: granular view of individual drone status (Active, Jammed, Offline).
- **Role-Based Telemetry**: Visual indicators for drone roles (Scout, Relay, Tracker, Interceptor).
- **Vital Stats**: Monitor battery levels, GPS signal strength, and peer connectivity mesh status.

### 🧠 AI Decision Engine
- **Transparent Logic**: A live feed of autonomous decisions made by the swarm.
- **Priority Queue**: Decisions are categorized by priority (Critical, High, Medium, Low).
- **Event Logging**:
    - **Navigation**: Response to GPS loss or terrain changes.
    - **Threats**: Reactions to jamming or hostile detection.
    - **Communication**: Mesh network adjustments and peer routing.
    - **Evasion**: Automatic maneuvers in response to electronic warfare.

### 📊 System Architecture
- **Modular Design**: dedicated panels for Architecture, Algorithms, Communication, Navigation, and Threat analysis.
- **Interactive Visualizations**: (Planned/Implemented) visual representations of system logic.

## 🛠️ Technology Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui, Radix UI
- **Icons**: Lucide React
- **State Management**: React Hooks (Context/Local State)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd sky-guardian-swarm
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

## 📂 Project Structure

- `src/components`: Core UI components (ControlPanel, DroneList, DecisionTaskbar, etc.).
- `src/types`: TypeScript definitions for Drones and shared interfaces.
- `src/hooks`: Custom React hooks for authentication and logic.
- `src/pages`: Main application pages and routing.

## 🛡️ License

This project is proprietary and intended for simulation and training purposes.
