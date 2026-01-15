import React from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { useWebSocket } from '@/hooks/useWebSocket';
import Header from '@/components/Header';
import MainTabs from '@/components/MainTabs';

const Index: React.FC = () => {
  const {
    state,
    toggleSimulation,
    toggleGPS,
    toggleJamming,
    resetSimulation,
    getMetrics,
    updateLiveDrone,
    setDeviceConnected,
  } = useSimulation();

  // WebSocket connection for live device
  const { connected: wsConnected } = useWebSocket((liveData) => {
    console.log('📥 Index received live data:', liveData);
    console.log('🎯 Drone ID:', liveData.id);
    console.log('📍 Position:', liveData.position);
    console.log('🧭 Heading:', liveData.heading);
    console.log('🔋 Battery:', liveData.battery);
    console.log('🟢 Online:', liveData.online);

    console.log('🔄 Calling updateLiveDrone...');
    updateLiveDrone(liveData);

    console.log('🔄 Calling setDeviceConnected:', liveData.online);
    setDeviceConnected(liveData.online);
  });

  const metrics = getMetrics();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Scan line overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        <div className="scan-line w-full h-32" />
      </div>

      <div className="container mx-auto p-4 flex-1 flex flex-col">
        <Header />

        <div className="flex-1 mt-4">
          <MainTabs
            state={state}
            metrics={metrics}
            onToggleSimulation={toggleSimulation}
            onToggleGPS={toggleGPS}
            onToggleJamming={toggleJamming}
            onReset={resetSimulation}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="tactical-panel mx-4 mb-4 p-3">
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
  );
};

export default Index;
