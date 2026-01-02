import React, { useEffect, useState, useRef } from 'react';
import { Drone } from '@/types/drone';
import { 
  Brain, 
  AlertTriangle, 
  Navigation, 
  Radio, 
  Shield, 
  Crosshair,
  ArrowRight,
  Zap,
  ChevronUp,
  ChevronDown,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Decision {
  id: string;
  droneId: string;
  droneName: string;
  type: 'navigation' | 'threat' | 'communication' | 'role' | 'evasion' | 'tracking';
  message: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface DecisionTaskbarProps {
  drones: Drone[];
  isRunning: boolean;
}

const DecisionTaskbar: React.FC<DecisionTaskbarProps> = ({ drones, isRunning }) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
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
      setDecisions(prev => [...newDecisions, ...prev].slice(0, 100));
    }

    prevDronesRef.current = drones;
  }, [drones, isRunning]);

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

  const getPriorityStyles = (priority: Decision['priority']) => {
    switch (priority) {
      case 'critical': return { text: 'text-tactical-red', bg: 'bg-tactical-red/20', border: 'border-tactical-red/50' };
      case 'high': return { text: 'text-tactical-amber', bg: 'bg-tactical-amber/20', border: 'border-tactical-amber/50' };
      case 'medium': return { text: 'text-primary', bg: 'bg-primary/20', border: 'border-primary/50' };
      case 'low': return { text: 'text-tactical-green', bg: 'bg-tactical-green/20', border: 'border-tactical-green/50' };
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

  const recentDecisions = decisions.slice(0, 20);
  const criticalCount = decisions.filter(d => d.priority === 'critical').length;
  const highCount = decisions.filter(d => d.priority === 'high').length;

  return (
    <div className="mx-4 mb-2">
      <div className="tactical-panel overflow-hidden">
        {/* Taskbar Header */}
        <div 
          className="flex items-center justify-between px-4 py-2 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="font-tactical text-sm text-primary tracking-wider">AI DECISION ENGINE</h2>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
                <Activity className={`w-3 h-3 ${isRunning ? 'text-tactical-green animate-pulse' : 'text-muted-foreground'}`} />
                <span className={isRunning ? 'text-tactical-green' : 'text-muted-foreground'}>
                  {isRunning ? 'PROCESSING' : 'STANDBY'}
                </span>
              </div>
              
              {criticalCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-tactical-red/20 text-tactical-red animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{criticalCount} CRITICAL</span>
                </div>
              )}
              
              {highCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-tactical-amber/20 text-tactical-amber">
                  <span>{highCount} HIGH</span>
                </div>
              )}
              
              <span className="text-muted-foreground">
                {decisions.length} total decisions logged
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-[10px]">
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
            
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Expandable Decision Feed */}
        {isExpanded && (
          <div className="p-4">
            {recentDecisions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Start mission to see autonomous decisions</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-border">
                {recentDecisions.map((decision, index) => {
                  const styles = getPriorityStyles(decision.priority);
                  return (
                    <div 
                      key={decision.id}
                      className={`p-2 rounded border text-xs animate-fade-in ${styles.bg} ${styles.border}`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={styles.text}>
                            {getIcon(decision.type)}
                          </span>
                          <span className={`font-medium ${styles.text}`}>{decision.droneName}</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">
                          {formatTime(decision.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-start gap-1 text-foreground/80">
                        <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{decision.message}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionTaskbar;
