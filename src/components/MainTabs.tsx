import React, { useState } from 'react';
import { 
  Settings, 
  Map, 
  Layers, 
  Activity, 
  Users, 
  Sparkles 
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ControlPanel from '@/components/ControlPanel';
import StatusPanel from '@/components/StatusPanel';
import TacticalMap from '@/components/TacticalMap';
import DroneList from '@/components/DroneList';
import FeatureTabs from '@/components/FeatureTabs';
import AIPanel from '@/components/FeaturePanels/AIPanel';
import { Drone, Target, JammingZone, MeshLink, SimulationMetrics } from '@/types/drone';

const mainTabs = [
  { id: 'mission', label: 'Mission Control', icon: Settings },
  { id: 'features', label: 'System Features', icon: Layers },
  { id: 'status', label: 'System Status', icon: Activity },
  { id: 'swarm', label: 'Swarm Roster', icon: Users },
  { id: 'ai', label: 'AI Decision Engine', icon: Sparkles },
] as const;

type MainTabId = typeof mainTabs[number]['id'];

interface MainTabsProps {
  state: {
    drones: Drone[];
    targets: Target[];
    jammingZones: JammingZone[];
    meshLinks: MeshLink[];
    simulationRunning: boolean;
    gpsEnabled: boolean;
    jammingActive: boolean;
    timeElapsed: number;
    missionStatus: string;
  };
  metrics: SimulationMetrics;
  onToggleSimulation: () => void;
  onToggleGPS: () => void;
  onToggleJamming: () => void;
  onReset: () => void;
}

const MainTabs: React.FC<MainTabsProps> = ({
  state,
  metrics,
  onToggleSimulation,
  onToggleGPS,
  onToggleJamming,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<MainTabId>('mission');

  const renderContent = () => {
    switch (activeTab) {
      case 'mission':
        return (
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-tactical text-lg text-primary tracking-wider">
                MISSION CONTROL
              </h2>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>GRID: 40m</span>
                <span>SCALE: 1:1000</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
              <div className="lg:col-span-1">
                <ControlPanel
                  isRunning={state.simulationRunning}
                  gpsEnabled={state.gpsEnabled}
                  jammingActive={state.jammingActive}
                  onToggleSimulation={onToggleSimulation}
                  onToggleGPS={onToggleGPS}
                  onToggleJamming={onToggleJamming}
                  onReset={onReset}
                />
              </div>
              <div className="lg:col-span-3 h-[400px]">
                <TacticalMap
                  drones={state.drones}
                  jammingZones={state.jammingZones}
                  targets={state.targets}
                  meshLinks={state.meshLinks}
                />
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="p-4">
            <h2 className="font-tactical text-lg text-primary tracking-wider mb-4">
              SYSTEM FEATURES
            </h2>
            <FeatureTabs drones={state.drones} targets={state.targets} />
          </div>
        );

      case 'status':
        return (
          <div className="p-4">
            <h2 className="font-tactical text-lg text-primary tracking-wider mb-4">
              SYSTEM STATUS
            </h2>
            <div className="max-w-lg">
              <StatusPanel
                metrics={metrics}
                timeElapsed={state.timeElapsed}
                missionStatus={state.missionStatus}
              />
            </div>
          </div>
        );

      case 'swarm':
        return (
          <div className="p-4">
            <h2 className="font-tactical text-lg text-primary tracking-wider mb-4">
              SWARM ROSTER
            </h2>
            <DroneList drones={state.drones} />
          </div>
        );

      case 'ai':
        return (
          <div className="p-4">
            <h2 className="font-tactical text-lg text-primary tracking-wider mb-4">
              AI DECISION ENGINE
            </h2>
            <AIPanel drones={state.drones} targets={state.targets} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Tab Navigation */}
      <div className="tactical-panel p-2 mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-tactical whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/40 tactical-glow'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 border border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tactical-panel flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {renderContent()}
        </ScrollArea>
      </div>
    </div>
  );
};

export default MainTabs;
