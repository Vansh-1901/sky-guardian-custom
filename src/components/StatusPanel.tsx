import React from 'react';
import { SimulationMetrics } from '@/types/drone';
import { Activity, Wifi, Shield, Target, Battery, Network } from 'lucide-react';

interface StatusPanelProps {
  metrics: SimulationMetrics;
  timeElapsed: number;
  missionStatus: string;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ metrics, timeElapsed, missionStatus }) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (value: number, thresholds: [number, number] = [30, 70]): string => {
    if (value < thresholds[0]) return 'text-tactical-red';
    if (value < thresholds[1]) return 'text-tactical-amber';
    return 'text-tactical-green';
  };

  return (
    <div className="tactical-panel p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="font-tactical text-sm text-primary tracking-wider">SYSTEM STATUS</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${missionStatus === 'active' ? 'bg-tactical-green animate-pulse' : 'bg-tactical-amber'}`} />
          <span className="text-xs text-muted-foreground uppercase">{missionStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<Activity className="w-4 h-4" />}
          label="Active Drones"
          value={metrics.activeDrones}
          suffix={`/${metrics.activeDrones + metrics.jammedDrones}`}
          color="text-tactical-cyan"
        />
        <MetricCard
          icon={<Wifi className="w-4 h-4" />}
          label="Jammed"
          value={metrics.jammedDrones}
          color={metrics.jammedDrones > 0 ? 'text-tactical-amber' : 'text-tactical-green'}
        />
        <MetricCard
          icon={<Network className="w-4 h-4" />}
          label="Mesh Network"
          value={Math.round(metrics.meshConnectivity)}
          suffix="%"
          color={getStatusColor(metrics.meshConnectivity)}
        />
        <MetricCard
          icon={<Shield className="w-4 h-4" />}
          label="Resilience"
          value={Math.round(metrics.networkResilience)}
          suffix="%"
          color={getStatusColor(metrics.networkResilience)}
        />
        <MetricCard
          icon={<Target className="w-4 h-4" />}
          label="Threats"
          value={metrics.threatCount}
          color={metrics.threatCount > 0 ? 'text-tactical-red' : 'text-tactical-green'}
        />
        <MetricCard
          icon={<Battery className="w-4 h-4" />}
          label="Avg Battery"
          value={Math.round(metrics.avgBattery)}
          suffix="%"
          color={getStatusColor(metrics.avgBattery, [20, 50])}
        />
      </div>

      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">MISSION TIME</span>
          <span className="font-tactical text-lg text-primary tactical-text">
            {formatTime(timeElapsed)}
          </span>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary">{Math.round(metrics.missionProgress)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-tactical-green transition-all duration-300"
              style={{ width: `${metrics.missionProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, suffix = '', color }) => (
  <div className="bg-muted/50 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-1">
      <span className={color}>{icon}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <div className={`font-tactical text-xl ${color}`}>
      {value}{suffix}
    </div>
  </div>
);

export default StatusPanel;
