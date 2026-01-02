import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Drone, JammingZone, Target, MeshLink } from '@/types/drone';
import { ZoomIn, ZoomOut, Move, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  
  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;

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

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)));
  }, []);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, []);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastMousePos]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(MAX_ZOOM, prev + 0.2));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(MIN_ZOOM, prev - 0.2));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;

    // Clear canvas
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, width, height);

    // Save context and apply transformations
    ctx.save();
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    // Scale factor for positioning elements (based on original 800x600)
    const scaleX = width / 800;
    const scaleY = height / 600;

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 180, 216, 0.1)';
    ctx.lineWidth = 1 / zoom;
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
      ctx.lineWidth = 2 / zoom;
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
      ctx.lineWidth = (link.active ? 2 : 1) / zoom;
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
      ctx.lineWidth = 2 / zoom;
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
      ctx.lineWidth = 2 / zoom;
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
        ctx.lineWidth = 1 / zoom;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, 18 * droneScale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Restore context before drawing scan effect (so it covers full canvas)
    ctx.restore();

    // Draw scan effect (on top, no transformation)
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

  }, [drones, jammingZones, targets, meshLinks, dimensions, zoom, pan]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[300px]">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="rounded-lg border border-border absolute inset-0 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-primary/20"
          onClick={zoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4 text-primary" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-primary/20"
          onClick={zoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4 text-primary" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-primary/20"
          onClick={resetView}
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4 text-primary" />
        </Button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded border border-primary/30 text-xs font-tactical text-primary z-10">
        <Move className="h-3 w-3 inline mr-1" />
        {Math.round(zoom * 100)}%
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary pointer-events-none" />
    </div>
  );
};

export default TacticalMap;
