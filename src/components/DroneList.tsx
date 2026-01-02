import React from 'react';
import { Drone } from '@/types/drone';
import { 
  Navigation, 
  Wifi, 
  WifiOff, 
  Battery, 
  Crosshair,
  Radio,
  Eye,
  Zap
} from 'lucide-react';

interface DroneListProps {
  drones: Drone[];
}

const DroneList: React.FC<DroneListProps> = ({ drones }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'scout': return <Eye className="w-3 h-3" />;
      case 'relay': return <Radio className="w-3 h-3" />;
      case 'tracker': return <Crosshair className="w-3 h-3" />;
      case 'interceptor': return <Zap className="w-3 h-3" />;
      default: return <Navigation className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-tactical-green';
      case 'jammed': return 'text-tactical-amber';
      case 'offline': return 'text-muted-foreground';
      case 'destroyed': return 'text-tactical-red';
      default: return 'text-foreground';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery < 20) return 'text-tactical-red';
    if (battery < 50) return 'text-tactical-amber';
    return 'text-tactical-green';
  };

  return (
    <div className="tactical-panel p-4 space-y-4">
      <h2 className="font-tactical text-sm text-primary tracking-wider border-b border-border pb-3">
        SWARM ROSTER
      </h2>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border">
        {drones.map((drone) => (
          <div 
            key={drone.id}
            className={`p-3 rounded-lg border transition-all ${
              drone.status === 'active' 
                ? 'bg-muted/30 border-border hover:border-primary/50' 
                : drone.status === 'jammed'
                  ? 'bg-tactical-amber/5 border-tactical-amber/30'
                  : 'bg-muted/10 border-border/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${getStatusColor(drone.status)} bg-current/10`}>
                  {getRoleIcon(drone.role)}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {drone.role.toUpperCase()}-{drone.id.slice(0, 4).toUpperCase()}
                  </div>
                  <div className={`text-xs ${getStatusColor(drone.status)}`}>
                    {drone.status.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {drone.gpsAvailable ? (
                  <Wifi className="w-3 h-3 text-tactical-green" />
                ) : (
                  <WifiOff className="w-3 h-3 text-tactical-red" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">POS</div>
                <div className="font-mono">
                  {Math.round(drone.position.x)},{Math.round(drone.position.y)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">HDG</div>
                <div className="font-mono">{Math.round(drone.heading)}°</div>
              </div>
              <div>
                <div className="text-muted-foreground">PEERS</div>
                <div className="font-mono">{drone.connectedPeers.length}</div>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Battery className={`w-3 h-3 ${getBatteryColor(drone.battery)}`} />
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    drone.battery < 20 ? 'bg-tactical-red' :
                    drone.battery < 50 ? 'bg-tactical-amber' : 'bg-tactical-green'
                  }`}
                  style={{ width: `${drone.battery}%` }}
                />
              </div>
              <span className={`text-xs ${getBatteryColor(drone.battery)}`}>
                {Math.round(drone.battery)}%
              </span>
            </div>

            {drone.threatLevel !== 'none' && (
              <div className={`mt-2 text-xs px-2 py-1 rounded ${
                drone.threatLevel === 'high' || drone.threatLevel === 'critical'
                  ? 'bg-tactical-red/20 text-tactical-red'
                  : 'bg-tactical-amber/20 text-tactical-amber'
              }`}>
                THREAT: {drone.threatLevel.toUpperCase()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DroneList;
