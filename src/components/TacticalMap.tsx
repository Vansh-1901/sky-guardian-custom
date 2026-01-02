import React, { useRef, useEffect, useState } from 'react';
import { Drone, JammingZone, Target, MeshLink } from '@/types/drone';

interface TacticalMapProps {
  drones: Drone[];
  jammingZones: JammingZone[];
  targets: Target[];
  meshLinks: MeshLink[];
}

const TacticalMap: React.FC<TacticalMapProps> = ({
  drones,
  jammingZones,
  targets,
  meshLinks,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Resize observer to track container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;

    // Scale factor for positioning elements (based on original 800x600)
    const scaleX = width / 800;
    const scaleY = height / 600;

    // Clear canvas
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 180, 216, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = 40 * Math.min(scaleX, scaleY);
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw jamming zones
    jammingZones.forEach(zone => {
      if (!zone.active) return;
      
      const scaledX = zone.center.x * scaleX;
      const scaledY = zone.center.y * scaleY;
      const scaledRadius = zone.radius * Math.min(scaleX, scaleY);
      
      const gradient = ctx.createRadialGradient(
        scaledX, scaledY, 0,
        scaledX, scaledY, scaledRadius
      );
      gradient.addColorStop(0, `rgba(239, 68, 68, ${zone.intensity * 0.4})`);
      gradient.addColorStop(0.7, `rgba(239, 68, 68, ${zone.intensity * 0.2})`);
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(scaledX, scaledY, scaledRadius, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing border
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(Date.now() / 500) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Jamming icon
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = `${Math.max(10, 12 * Math.min(scaleX, scaleY))}px Share Tech Mono`;
      ctx.textAlign = 'center';
      ctx.fillText('⚠ JAMMING', scaledX, scaledY);
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
      ctx.moveTo(fromDrone.position.x * scaleX, fromDrone.position.y * scaleY);
      ctx.lineTo(toDrone.position.x * scaleX, toDrone.position.y * scaleY);
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

      const scaledX = target.position.x * scaleX;
      const scaledY = target.position.y * scaleY;
      const markerSize = 10 * Math.min(scaleX, scaleY);

      // Target marker
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scaledX - markerSize, scaledY);
      ctx.lineTo(scaledX + markerSize, scaledY);
      ctx.moveTo(scaledX, scaledY - markerSize);
      ctx.lineTo(scaledX, scaledY + markerSize);
      ctx.stroke();

      // Target circle
      ctx.beginPath();
      ctx.arc(scaledX, scaledY, markerSize * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Tracking indicator
      if (target.tracked) {
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, markerSize * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw drones
    drones.forEach(drone => {
      const { position, heading, status, role, inJammingZone } = drone;
      
      const scaledX = position.x * scaleX;
      const scaledY = position.y * scaleY;
      const droneScale = Math.min(scaleX, scaleY);

      // Status color
      let color = '#00f0ff'; // active
      if (status === 'jammed') color = '#f59e0b';
      if (status === 'offline') color = '#6b7280';
      if (status === 'destroyed') color = '#ef4444';

      ctx.save();
      ctx.translate(scaledX, scaledY);
      ctx.rotate((heading * Math.PI) / 180);

      // Drone glow
      if (status === 'active') {
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 25 * droneScale);
        glow.addColorStop(0, `${color}40`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 25 * droneScale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drone body (triangle)
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(12 * droneScale, 0);
      ctx.lineTo(-8 * droneScale, -8 * droneScale);
      ctx.lineTo(-4 * droneScale, 0);
      ctx.lineTo(-8 * droneScale, 8 * droneScale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      // Role indicator
      ctx.fillStyle = color;
      ctx.font = `${Math.max(8, 10 * droneScale)}px Share Tech Mono`;
      ctx.textAlign = 'center';
      const roleChar = role[0].toUpperCase();
      ctx.fillText(roleChar, scaledX, scaledY + 25 * droneScale);

      // Status indicator for jammed drones
      if (inJammingZone) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, 18 * droneScale, 0, Math.PI * 2);
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

  }, [drones, jammingZones, targets, meshLinks, dimensions]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[300px]">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="rounded-lg border border-border absolute inset-0"
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
