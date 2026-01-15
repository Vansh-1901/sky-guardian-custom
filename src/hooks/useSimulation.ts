import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Drone,
  JammingZone,
  Target,
  MeshLink,
  SimulationState,
  SimulationMetrics,
  Position,
  DroneRole
} from '@/types/drone';

const DRONE_COUNT = 8;
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const MESH_RANGE = 150;
const JAMMING_EFFECT_RADIUS = 120;

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialDrones = (): Drone[] => {
  const roles: DroneRole[] = ['scout', 'relay', 'tracker', 'interceptor'];
  const drones: Drone[] = [];

  // First drone is PROXY-DRONE-01 (live device)
  drones.push({
    id: 'PROXY-DRONE-01',
    position: { x: 400, y: 300 }, // Center of map
    velocity: { vx: 0, vy: 0 },
    role: 'scout',
    status: 'active',
    battery: null, // Will show UNKNOWN until device connects
    signalStrength: 1,
    gpsAvailable: true,
    inJammingZone: false,
    threatLevel: 'none',
    connectedPeers: [],
    lastKnownPosition: { x: 400, y: 300 },
    heading: 0,
    altitude: 100,
    isLiveDevice: true,
  });

  // Add remaining simulated drones
  for (let i = 1; i < DRONE_COUNT; i++) {
    drones.push({
      id: generateId(),
      position: {
        x: 100 + Math.random() * 200,
        y: 200 + Math.random() * 200,
      },
      velocity: { vx: 0, vy: 0 },
      role: roles[i % roles.length],
      status: 'active',
      battery: 85 + Math.random() * 15,
      signalStrength: 0.9 + Math.random() * 0.1,
      gpsAvailable: true,
      inJammingZone: false,
      threatLevel: 'none',
      connectedPeers: [],
      lastKnownPosition: { x: 100 + Math.random() * 200, y: 200 + Math.random() * 200 },
      heading: Math.random() * 360,
      altitude: 100 + Math.random() * 50,
      isLiveDevice: false,
    });
  }

  return drones;
};

const createInitialJammingZones = (): JammingZone[] => [
  {
    id: generateId(),
    center: { x: 550, y: 300 },
    radius: JAMMING_EFFECT_RADIUS,
    intensity: 0.8,
    active: true,
  },
  {
    id: generateId(),
    center: { x: 400, y: 450 },
    radius: 80,
    intensity: 0.6,
    active: true,
  },
];

const createInitialTargets = (): Target[] => [
  {
    id: generateId(),
    position: { x: 650, y: 200 },
    velocity: { vx: -0.5, vy: 0.3 },
    type: 'hostile',
    tracked: false,
    trackedBy: [],
  },
  {
    id: generateId(),
    position: { x: 700, y: 400 },
    velocity: { vx: -0.3, vy: -0.2 },
    type: 'unknown',
    tracked: false,
    trackedBy: [],
  },
];

const distance = (p1: Position, p2: Position): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const useSimulation = () => {
  const [state, setState] = useState<SimulationState>({
    drones: createInitialDrones(),
    jammingZones: createInitialJammingZones(),
    targets: createInitialTargets(),
    meshLinks: [],
    gpsEnabled: true,
    jammingActive: true,
    simulationRunning: false,
    timeElapsed: 0,
    missionStatus: 'planning',
  });

  const [deviceConnected, setDeviceConnected] = useState(false);
  const [keyboardState, setKeyboardState] = useState({ w: false, a: false, s: false, d: false });

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const calculateMeshLinks = useCallback((drones: Drone[]): MeshLink[] => {
    const links: MeshLink[] = [];
    const activeDrones = drones.filter(d => d.status === 'active' || d.status === 'jammed');

    for (let i = 0; i < activeDrones.length; i++) {
      for (let j = i + 1; j < activeDrones.length; j++) {
        const dist = distance(activeDrones[i].position, activeDrones[j].position);
        if (dist < MESH_RANGE) {
          const strength = Math.max(0, 1 - dist / MESH_RANGE);
          const bothJammed = activeDrones[i].inJammingZone && activeDrones[j].inJammingZone;
          links.push({
            from: activeDrones[i].id,
            to: activeDrones[j].id,
            strength: bothJammed ? strength * 0.3 : strength,
            active: !bothJammed || strength > 0.5,
          });
        }
      }
    }
    return links;
  }, []);

  const updateDroneAI = useCallback((drone: Drone, allDrones: Drone[], jammingZones: JammingZone[], targets: Target[], gpsEnabled: boolean, deviceConnected: boolean, keyboardState: any): Drone => {
    // Skip AI for live device when device is connected
    if (drone.isLiveDevice && deviceConnected) {
      return drone; // Position/heading controlled by WebSocket
    }

    // Keyboard fallback for live device when disconnected
    if (drone.isLiveDevice && !deviceConnected) {
      const speed = 3;
      let newVelocity = { vx: 0, vy: 0 };
      let newHeading = drone.heading;

      if (keyboardState.w) newVelocity.vy = -speed;
      if (keyboardState.s) newVelocity.vy = speed;
      if (keyboardState.a) newVelocity.vx = -speed;
      if (keyboardState.d) newVelocity.vx = speed;

      // Update heading based on movement direction
      if (newVelocity.vx !== 0 || newVelocity.vy !== 0) {
        newHeading = Math.atan2(newVelocity.vy, newVelocity.vx) * (180 / Math.PI);
      }

      const newPosition = {
        x: Math.max(20, Math.min(MAP_WIDTH - 20, drone.position.x + newVelocity.vx)),
        y: Math.max(20, Math.min(MAP_HEIGHT - 20, drone.position.y + newVelocity.vy)),
      };

      return {
        ...drone,
        position: newPosition,
        velocity: newVelocity,
        heading: newHeading,
        lastKnownPosition: newPosition,
      };
    }
    let { position, velocity, heading } = drone;

    // Check jamming zone
    const inJamming = jammingZones.some(zone =>
      zone.active && distance(position, zone.center) < zone.radius
    );

    // Update GPS status
    const gpsAvailable = gpsEnabled && !inJamming;

    // Determine threat level
    let threatLevel = drone.threatLevel;
    const nearbyThreats = targets.filter(t =>
      t.type === 'hostile' && distance(position, t.position) < 200
    );
    if (nearbyThreats.length > 0) {
      threatLevel = nearbyThreats.length > 1 ? 'high' : 'medium';
    } else if (inJamming) {
      threatLevel = 'low';
    } else {
      threatLevel = 'none';
    }

    // AI Movement based on role
    let targetPos: Position | undefined;

    switch (drone.role) {
      case 'scout':
        // Move towards unexplored areas, avoid jamming
        if (inJamming) {
          // Move away from jamming center
          const nearestJam = jammingZones.reduce((nearest, zone) => {
            const dist = distance(position, zone.center);
            return dist < distance(position, nearest.center) ? zone : nearest;
          });
          const angle = Math.atan2(position.y - nearestJam.center.y, position.x - nearestJam.center.x);
          targetPos = {
            x: position.x + Math.cos(angle) * 50,
            y: position.y + Math.sin(angle) * 50,
          };
        } else {
          // Patrol pattern
          targetPos = {
            x: 400 + Math.cos(Date.now() / 5000 + parseInt(drone.id, 36)) * 200,
            y: 300 + Math.sin(Date.now() / 5000 + parseInt(drone.id, 36)) * 150,
          };
        }
        break;

      case 'tracker':
        // Follow hostile targets
        const hostileTarget = targets.find(t => t.type === 'hostile');
        if (hostileTarget) {
          targetPos = hostileTarget.position;
        }
        break;

      case 'relay':
        // Position between drones to maintain mesh
        const avgPos = allDrones.reduce(
          (acc, d) => ({ x: acc.x + d.position.x, y: acc.y + d.position.y }),
          { x: 0, y: 0 }
        );
        targetPos = {
          x: avgPos.x / allDrones.length,
          y: avgPos.y / allDrones.length,
        };
        break;

      case 'interceptor':
        // Move to intercept threats
        if (nearbyThreats.length > 0) {
          targetPos = nearbyThreats[0].position;
        }
        break;
    }

    // Calculate velocity towards target
    if (targetPos) {
      const dx = targetPos.x - position.x;
      const dy = targetPos.y - position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = drone.role === 'interceptor' ? 2 : 1;

      if (dist > 5) {
        velocity = {
          vx: (dx / dist) * speed,
          vy: (dy / dist) * speed,
        };
        heading = Math.atan2(dy, dx) * (180 / Math.PI);
      } else {
        velocity = { vx: 0, vy: 0 };
      }
    }

    // Apply velocity
    const newPosition = {
      x: Math.max(20, Math.min(MAP_WIDTH - 20, position.x + velocity.vx)),
      y: Math.max(20, Math.min(MAP_HEIGHT - 20, position.y + velocity.vy)),
    };

    // Update last known position if GPS is available
    const lastKnownPosition = gpsAvailable ? newPosition : drone.lastKnownPosition;

    // Drain battery slightly
    const battery = Math.max(0, drone.battery - 0.001);

    // Update signal strength based on jamming
    const signalStrength = inJamming
      ? Math.max(0.1, drone.signalStrength - 0.01)
      : Math.min(1, drone.signalStrength + 0.005);

    return {
      ...drone,
      position: newPosition,
      velocity,
      heading,
      gpsAvailable,
      inJammingZone: inJamming,
      threatLevel,
      lastKnownPosition,
      battery,
      signalStrength,
      status: battery !== null && battery <= 0 ? 'offline' : (inJamming ? 'jammed' : 'active'),
    };
  }, []);

  const updateTargets = useCallback((targets: Target[]): Target[] => {
    return targets.map(target => {
      const newPos = {
        x: Math.max(20, Math.min(MAP_WIDTH - 20, target.position.x + target.velocity.vx)),
        y: Math.max(20, Math.min(MAP_HEIGHT - 20, target.position.y + target.velocity.vy)),
      };

      // Bounce off edges
      let newVelocity = { ...target.velocity };
      if (newPos.x <= 20 || newPos.x >= MAP_WIDTH - 20) newVelocity.vx *= -1;
      if (newPos.y <= 20 || newPos.y >= MAP_HEIGHT - 20) newVelocity.vy *= -1;

      return {
        ...target,
        position: newPos,
        velocity: newVelocity,
      };
    });
  }, []);

  // Update live drone from WebSocket data
  const updateLiveDrone = useCallback((liveData: { id: string; position?: { x: number; y: number }; heading?: number; battery?: number | null; online: boolean }) => {
    console.log('🔧 updateLiveDrone called with:', liveData);
    console.log('🔍 Looking for drone with ID:', liveData.id);

    setState(prev => {
      console.log('📋 Current drones:', prev.drones.map(d => ({ id: d.id, isLiveDevice: d.isLiveDevice })));

      const updatedDrones = prev.drones.map(drone => {
        if (drone.id === liveData.id) {
          console.log('✅ Found PROXY-DRONE-01!');
          console.log('📊 Current drone state:', {
            id: drone.id,
            isLiveDevice: drone.isLiveDevice,
            position: drone.position,
            heading: drone.heading,
            battery: drone.battery,
            lastLiveUpdate: drone.lastLiveUpdate
          });

          const updated = {
            ...drone,
            position: liveData.position || drone.position,
            heading: liveData.heading !== undefined ? liveData.heading : drone.heading,
            battery: liveData.battery !== undefined ? liveData.battery : drone.battery,
            status: liveData.online ? 'active' as const : 'offline' as const,
            lastKnownPosition: liveData.position || drone.lastKnownPosition,
            lastLiveUpdate: Date.now(), // Set timestamp for live mode detection
            isLiveDevice: true, // Explicitly preserve this flag
          };

          console.log('🆕 Updated drone state:', {
            id: updated.id,
            isLiveDevice: updated.isLiveDevice,
            position: updated.position,
            heading: updated.heading,
            battery: updated.battery,
            lastLiveUpdate: updated.lastLiveUpdate,
            timeSinceUpdate: 0
          });

          return updated;
        }
        return drone;
      });

      const proxyDrone = updatedDrones.find(d => d.id === 'PROXY-DRONE-01');
      console.log('🔄 State updated with lastLiveUpdate timestamp');
      console.log('🎯 PROXY-DRONE-01 after update:', {
        found: !!proxyDrone,
        isLiveDevice: proxyDrone?.isLiveDevice,
        lastLiveUpdate: proxyDrone?.lastLiveUpdate,
        timeSinceUpdate: proxyDrone?.lastLiveUpdate ? Date.now() - proxyDrone.lastLiveUpdate : 'N/A'
      });

      return {
        ...prev,
        drones: updatedDrones,
      };
    });
  }, []);

  // Keyboard event handlers for fallback mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeyboardState(prev => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeyboardState(prev => ({ ...prev, [key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const simulate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;

    if (delta > 16) { // ~60fps
      lastTimeRef.current = timestamp;

      setState(prev => {
        if (!prev.simulationRunning) return prev;

        const updatedDrones = prev.drones.map(drone =>
          updateDroneAI(drone, prev.drones, prev.jammingZones, prev.targets, prev.gpsEnabled, deviceConnected, keyboardState)
        );

        const updatedTargets = updateTargets(prev.targets);
        const meshLinks = calculateMeshLinks(updatedDrones);

        // Update connected peers
        const dronesWithPeers = updatedDrones.map(drone => ({
          ...drone,
          connectedPeers: meshLinks
            .filter(link => link.active && (link.from === drone.id || link.to === drone.id))
            .map(link => link.from === drone.id ? link.to : link.from),
        }));

        return {
          ...prev,
          drones: dronesWithPeers,
          targets: updatedTargets,
          meshLinks,
          timeElapsed: prev.timeElapsed + delta / 1000,
          missionStatus: 'active',
        };
      });
    }

    animationRef.current = requestAnimationFrame(simulate);
  }, [updateDroneAI, updateTargets, calculateMeshLinks]);

  useEffect(() => {
    if (state.simulationRunning) {
      animationRef.current = requestAnimationFrame(simulate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.simulationRunning, simulate]);

  const toggleSimulation = useCallback(() => {
    setState(prev => ({ ...prev, simulationRunning: !prev.simulationRunning }));
  }, []);

  const toggleGPS = useCallback(() => {
    setState(prev => ({ ...prev, gpsEnabled: !prev.gpsEnabled }));
  }, []);

  const toggleJamming = useCallback(() => {
    setState(prev => ({
      ...prev,
      jammingActive: !prev.jammingActive,
      jammingZones: prev.jammingZones.map(z => ({ ...z, active: !prev.jammingActive })),
    }));
  }, []);

  const resetSimulation = useCallback(() => {
    setState({
      drones: createInitialDrones(),
      jammingZones: createInitialJammingZones(),
      targets: createInitialTargets(),
      meshLinks: [],
      gpsEnabled: true,
      jammingActive: true,
      simulationRunning: false,
      timeElapsed: 0,
      missionStatus: 'planning',
    });
    lastTimeRef.current = 0;
  }, []);

  const getMetrics = useCallback((): SimulationMetrics => {
    const activeDrones = state.drones.filter(d => d.status === 'active').length;
    const jammedDrones = state.drones.filter(d => d.status === 'jammed').length;
    const activeLinks = state.meshLinks.filter(l => l.active).length;
    const totalPossibleLinks = (state.drones.length * (state.drones.length - 1)) / 2;
    const avgBattery = state.drones.reduce((sum, d) => sum + (d.battery || 0), 0) / state.drones.length;

    return {
      activeDrones,
      jammedDrones,
      meshConnectivity: totalPossibleLinks > 0 ? (activeLinks / totalPossibleLinks) * 100 : 0,
      missionProgress: Math.min(100, state.timeElapsed * 2),
      threatCount: state.targets.filter(t => t.type === 'hostile').length,
      avgBattery,
      networkResilience: activeDrones > 0 ? ((activeDrones + jammedDrones * 0.5) / state.drones.length) * 100 : 0,
    };
  }, [state]);

  return {
    state,
    toggleSimulation,
    toggleGPS,
    toggleJamming,
    resetSimulation,
    getMetrics,
    updateLiveDrone,
    setDeviceConnected,
    deviceConnected,
  };
};
