export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export type DroneRole = 'scout' | 'relay' | 'tracker' | 'interceptor';
export type DroneStatus = 'active' | 'jammed' | 'destroyed' | 'offline';
export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface Drone {
  id: string;
  position: Position;
  velocity: Velocity;
  role: DroneRole;
  status: DroneStatus;
  battery: number | null; // null = UNKNOWN (battery API unavailable)
  signalStrength: number;
  gpsAvailable: boolean;
  inJammingZone: boolean;
  threatLevel: ThreatLevel;
  connectedPeers: string[];
  targetPosition?: Position;
  lastKnownPosition: Position;
  heading: number;
  altitude: number;
  isLiveDevice?: boolean; // true for PROXY-DRONE-01
  lastLiveUpdate?: number; // Timestamp of last live data update
}

export interface JammingZone {
  id: string;
  center: Position;
  radius: number;
  intensity: number; // 0-1
  active: boolean;
}

export interface Target {
  id: string;
  position: Position;
  velocity: Velocity;
  type: 'hostile' | 'unknown' | 'friendly';
  tracked: boolean;
  trackedBy: string[];
}

export interface MeshLink {
  from: string;
  to: string;
  strength: number; // 0-1
  active: boolean;
}

export interface SimulationState {
  drones: Drone[];
  jammingZones: JammingZone[];
  targets: Target[];
  meshLinks: MeshLink[];
  gpsEnabled: boolean;
  jammingActive: boolean;
  simulationRunning: boolean;
  timeElapsed: number;
  missionStatus: 'planning' | 'active' | 'complete' | 'failed';
}

export interface SimulationMetrics {
  activeDrones: number;
  jammedDrones: number;
  meshConnectivity: number;
  missionProgress: number;
  threatCount: number;
  avgBattery: number;
  networkResilience: number;
}
