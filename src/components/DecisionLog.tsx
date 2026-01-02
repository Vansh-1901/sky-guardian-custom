import React, { useEffect, useState, useRef } from 'react';
import { Drone } from '@/types/drone';
import { 
  Brain, 
  AlertTriangle, 
  Navigation, 
  Radio, 
  Shield, 
  Crosshair,
  Wifi,
  WifiOff,
  ArrowRight,
  Zap
} from 'lucide-react';

interface Decision {
  id: string;
  droneId: string;
  droneName: string;
  type: 'navigation' | 'threat' | 'communication' | 'role' | 'evasion' | 'tracking';
  message: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface DecisionLogProps {
  drones: Drone[];
  isRunning: boolean;
}

const DecisionLog: React.FC<DecisionLogProps> = ({ drones, isRunning }) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const prevDronesRef = useRef<Drone[]>([]);

  useEffect(() => {
    if (!isRunning) return;

    const newDecisions: Decision[] = [];
    const now = Date.now();

    drones.forEach(drone => {
      const prevDrone = prevDronesRef.current.find(d => d.id === drone.id);
      if (!prevDrone) return;

      const droneName = `${drone.role.toUpperCase()}-${drone.id.slice(0, 4).toUpperCase()}`;

      // Entered jamming zone
      if (drone.inJammingZone && !prevDrone.inJammingZone) {
        newDecisions.push({
          id: `${drone.id}-jam-${now}`,
          droneId: drone.id,
          droneName,
          type: 'evasion',
          message: 'Jamming detected → Initiating evasive maneuvers',
          timestamp: now,
          priority: 'high',
        });
      }

      // Exited jamming zone
      if (!drone.inJammingZone && prevDrone.inJammingZone) {
        newDecisions.push({
          id: `${drone.id}-clear-${now}`,
          droneId: drone.id,
          droneName,
          type: 'navigation',
          message: 'Jamming zone cleared → Resuming normal operations',
          timestamp: now,
          priority: 'medium',
        });
      }

      // GPS status change
      if (drone.gpsAvailable !== prevDrone.gpsAvailable) {
        newDecisions.push({
          id: `${drone.id}-gps-${now}`,
          droneId: drone.id,
          droneName,
          type: 'navigation',
          message: drone.gpsAvailable 
            ? 'GPS acquired → Updating position lock' 
            : 'GPS denied → Switching to inertial navigation',
          timestamp: now,
          priority: drone.gpsAvailable ? 'low' : 'high',
        });
      }

      // Threat level change
      if (drone.threatLevel !== prevDrone.threatLevel && drone.threatLevel !== 'none') {
        newDecisions.push({
          id: `${drone.id}-threat-${now}`,
          droneId: drone.id,
          droneName,
          type: 'threat',
          message: `Threat level: ${drone.threatLevel.toUpperCase()} → Adjusting posture`,
          timestamp: now,
          priority: drone.threatLevel === 'high' || drone.threatLevel === 'critical' ? 'critical' : 'medium',
        });
      }

      // Mesh network changes
      if (drone.connectedPeers.length !== prevDrone.connectedPeers.length) {
        if (drone.connectedPeers.length > prevDrone.connectedPeers.length) {
          newDecisions.push({
            id: `${drone.id}-mesh-up-${now}`,
            droneId: drone.id,
            droneName,
            type: 'communication',
            message: `New peer connected → Mesh expanded to ${drone.connectedPeers.length} nodes`,
            timestamp: now,
            priority: 'low',
          });
        } else if (drone.connectedPeers.length < prevDrone.connectedPeers.length) {
          newDecisions.push({
            id: `${drone.id}-mesh-down-${now}`,
            droneId: drone.id,
            droneName,
            type: 'communication',
            message: `Peer lost → Rerouting through ${drone.connectedPeers.length} remaining nodes`,
            timestamp: now,
            priority: 'medium',
          });
        }
      }

      // Role-based decisions (occasional)
      if (Math.random() < 0.01 && drone.status === 'active') {
        const roleDecisions: Record<string, string[]> = {
          scout: [
            'Scanning sector → No new contacts',
            'Adjusting patrol pattern → Optimizing coverage',
            'Terrain analysis → Updating navigation mesh',
          ],
          relay: [
            'Signal strength optimal → Maintaining position',
            'Rebalancing mesh → Centering between nodes',
            'Bandwidth allocation → Prioritizing tactical data',
          ],
          tracker: [
            'Target bearing updated → Adjusting intercept vector',
            'Predictive tracking → Calculating target trajectory',
            'Lock maintained → Target designated',
          ],
          interceptor: [
            'Combat ready → Awaiting engagement orders',
            'Threat assessment → Calculating approach vector',
            'Weapons check → Systems nominal',
          ],
        };

        const messages = roleDecisions[drone.role] || ['Processing...'];
        newDecisions.push({
          id: `${drone.id}-role-${now}`,
          droneId: drone.id,
          droneName,
          type: 'role',
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: now,
          priority: 'low',
        });
      }
    });

    if (newDecisions.length > 0) {
      setDecisions(prev => [...newDecisions, ...prev].slice(0, 50));
    }

    prevDronesRef.current = drones;
  }, [drones, isRunning]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [decisions]);

  const getIcon = (type: Decision['type']) => {
    switch (type) {
      case 'navigation': return <Navigation className="w-3 h-3" />;
      case 'threat': return <AlertTriangle className="w-3 h-3" />;
      case 'communication': return <Radio className="w-3 h-3" />;
      case 'role': return <Brain className="w-3 h-3" />;
      case 'evasion': return <Shield className="w-3 h-3" />;
      case 'tracking': return <Crosshair className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority: Decision['priority']) => {
    switch (priority) {
      case 'critical': return 'text-tactical-red border-tactical-red/50 bg-tactical-red/10';
      case 'high': return 'text-tactical-amber border-tactical-amber/50 bg-tactical-amber/10';
      case 'medium': return 'text-primary border-primary/50 bg-primary/10';
      case 'low': return 'text-tactical-green border-tactical-green/50 bg-tactical-green/10';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="tactical-panel p-4 h-full">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <h2 className="font-tactical text-sm text-primary tracking-wider">AI DECISIONS</h2>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-tactical-green animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="text-xs text-muted-foreground">
            {isRunning ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
      </div>

      <div 
        ref={logRef}
        className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-border pr-1"
      >
        {decisions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Start mission to see autonomous decisions</p>
          </div>
        ) : (
          decisions.map((decision, index) => (
            <div 
              key={decision.id}
              className={`p-2 rounded border text-xs animate-fade-in ${getPriorityColor(decision.priority)}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={getPriorityColor(decision.priority).split(' ')[0]}>
                    {getIcon(decision.type)}
                  </span>
                  <span className="font-medium">{decision.droneName}</span>
                </div>
                <span className="text-muted-foreground text-[10px]">
                  {formatTime(decision.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-foreground/80">
                <ArrowRight className="w-3 h-3 flex-shrink-0" />
                <span>{decision.message}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="grid grid-cols-4 gap-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-tactical-red" />
            <span className="text-muted-foreground">Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-tactical-amber" />
            <span className="text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-tactical-green" />
            <span className="text-muted-foreground">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionLog;
