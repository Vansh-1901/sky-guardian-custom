import React from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import Header from '@/components/Header';
import TacticalMap from '@/components/TacticalMap';
import StatusPanel from '@/components/StatusPanel';
import ControlPanel from '@/components/ControlPanel';
import DroneList from '@/components/DroneList';
import Legend from '@/components/Legend';
import DecisionLog from '@/components/DecisionLog';

const Index: React.FC = () => {
  const {
    state,
    toggleSimulation,
    toggleGPS,
    toggleJamming,
    resetSimulation,
    getMetrics,
  } = useSimulation();

  const metrics = getMetrics();

  return (
    <div className="min-h-screen bg-background">
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        <div className="scan-line w-full h-32" />
      </div>

      <div className="container mx-auto p-4 space-y-4">
        <Header />

        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <ControlPanel
              isRunning={state.simulationRunning}
              gpsEnabled={state.gpsEnabled}
              jammingActive={state.jammingActive}
              onToggleSimulation={toggleSimulation}
              onToggleGPS={toggleGPS}
              onToggleJamming={toggleJamming}
              onReset={resetSimulation}
            />
            <StatusPanel
              metrics={metrics}
              timeElapsed={state.timeElapsed}
              missionStatus={state.missionStatus}
            />
          </div>

          {/* Center - Tactical Map */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            <div className="tactical-panel p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-tactical text-sm text-primary tracking-wider">
                  TACTICAL OVERVIEW
                </h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>GRID: 40m</span>
                  <span>SCALE: 1:1000</span>
                </div>
              </div>
              <TacticalMap
                drones={state.drones}
                jammingZones={state.jammingZones}
                targets={state.targets}
                meshLinks={state.meshLinks}
              />
            </div>
            
            {/* Decision Log below map */}
            <DecisionLog 
              drones={state.drones} 
              isRunning={state.simulationRunning} 
            />
          </div>

          {/* Right Panel */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <DroneList drones={state.drones} />
            <Legend />
          </div>
        </div>

        {/* Footer */}
        <footer className="tactical-panel p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>CHAKRAVYUH 1.0</span>
              <span>|</span>
              <span>GITACVPS005</span>
            </div>
            <div className="flex items-center gap-4">
              <span>DECENTRALIZED SWARM INTELLIGENCE</span>
              <span>|</span>
              <span>GPS-DENIED OPERATIONS</span>
              <span>|</span>
              <span>SELF-HEALING MESH</span>
            </div>
            <div>
              SKY-SHIELD SIMULATION v1.0
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
