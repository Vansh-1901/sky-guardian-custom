import React, { useRef, useEffect } from 'react';
import { Drone, JammingZone, Target, MeshLink } from '@/types/drone';

interface TacticalMapProps {
  drones: Drone[];
  jammingZones: JammingZone[];
  targets: Target[];
  meshLinks: MeshLink[];
  width?: number;
  height?: number;
}

const TacticalMap: React.FC<TacticalMapProps> = ({
  drones,
  jammingZones,
  targets,
  meshLinks,
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 180, 216, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw jamming zones
    jammingZones.forEach(zone => {
      if (!zone.active) return;
      
      const gradient = ctx.createRadialGradient(
        zone.center.x, zone.center.y, 0,
        zone.center.x, zone.center.y, zone.radius
      );
      gradient.addColorStop(0, `rgba(239, 68, 68, ${zone.intensity * 0.4})`);
      gradient.addColorStop(0.7, `rgba(239, 68, 68, ${zone.intensity * 0.2})`);
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(zone.center.x, zone.center.y, zone.radius, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing border
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(Date.now() / 500) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Jamming icon
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = '12px Share Tech Mono';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ JAMMING', zone.center.x, zone.center.y);
    });

    // Draw mesh links
    meshLinks.forEach(link => {
      const fromDrone = drones.find(d => d.id === link.from);
      const toDrone = drones.find(d => d.id === link.to);
      if (!fromDrone || !toDrone) return;

      ctx.strokeStyle = link.active 
        ? `rgba(34, 197, 94, ${link.strength * 0.8})`
        : `rgba(251, 191, 36, ${link.strength * 0.5})`;
      ctx.lineWidth = link.active ? 2 : 1;
      ctx.setLineDash(link.active ? [] : [3, 3]);
      
      ctx.beginPath();
      ctx.moveTo(fromDrone.position.x, fromDrone.position.y);
      ctx.lineTo(toDrone.position.x, toDrone.position.y);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw targets
    targets.forEach(target => {
      const color = target.type === 'hostile' 
        ? '#ef4444' 
        : target.type === 'unknown' 
          ? '#f59e0b' 
          : '#22c55e';

      // Target marker
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(target.position.x - 10, target.position.y);
      ctx.lineTo(target.position.x + 10, target.position.y);
      ctx.moveTo(target.position.x, target.position.y - 10);
      ctx.lineTo(target.position.x, target.position.y + 10);
      ctx.stroke();

      // Target circle
      ctx.beginPath();
      ctx.arc(target.position.x, target.position.y, 15, 0, Math.PI * 2);
      ctx.stroke();

      // Tracking indicator
      if (target.tracked) {
        ctx.beginPath();
        ctx.arc(target.position.x, target.position.y, 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw drones
    drones.forEach(drone => {
      const { position, heading, status, role, inJammingZone } = drone;

      // Status color
      let color = '#00f0ff'; // active
      if (status === 'jammed') color = '#f59e0b';
      if (status === 'offline') color = '#6b7280';
      if (status === 'destroyed') color = '#ef4444';

      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate((heading * Math.PI) / 180);

      // Drone glow
      if (status === 'active') {
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
        glow.addColorStop(0, `${color}40`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drone body (triangle)
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, -8);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      // Role indicator
      ctx.fillStyle = color;
      ctx.font = '10px Share Tech Mono';
      ctx.textAlign = 'center';
      const roleChar = role[0].toUpperCase();
      ctx.fillText(roleChar, position.x, position.y + 25);

      // Status indicator for jammed drones
      if (inJammingZone) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(position.x, position.y, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw scan effect
    const scanAngle = (Date.now() / 50) % 360;
    const scanGradient = ctx.createConicGradient(
      (scanAngle * Math.PI) / 180,
      width / 2,
      height / 2
    );
    scanGradient.addColorStop(0, 'rgba(0, 240, 255, 0.1)');
    scanGradient.addColorStop(0.1, 'rgba(0, 240, 255, 0)');
    scanGradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
    
    ctx.fillStyle = scanGradient;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.max(width, height), 0, Math.PI * 2);
    ctx.fill();

  }, [drones, jammingZones, targets, meshLinks, width, height]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg border border-border"
      />
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary" />
    </div>
  );
};

export default TacticalMap;
