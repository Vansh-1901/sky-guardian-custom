import React from 'react';

const Legend: React.FC = () => {
  return (
    <div className="tactical-panel p-4">
      <h2 className="font-tactical text-sm text-primary tracking-wider border-b border-border pb-3 mb-3">
        MAP LEGEND
      </h2>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <LegendItem color="bg-tactical-cyan" label="Active Drone" />
        <LegendItem color="bg-tactical-amber" label="Jammed Drone" />
        <LegendItem color="bg-tactical-green" label="Mesh Link" />
        <LegendItem color="bg-tactical-red" dashed label="Hostile Target" />
        <LegendItem 
          color="bg-tactical-red/30" 
          glow 
          label="Jamming Zone" 
        />
        <LegendItem color="bg-tactical-amber" dashed label="Unknown Target" />
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">DRONE ROLES</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-muted flex items-center justify-center text-primary">S</span>
            <span>Scout</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-muted flex items-center justify-center text-primary">R</span>
            <span>Relay</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-muted flex items-center justify-center text-primary">T</span>
            <span>Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-muted flex items-center justify-center text-primary">I</span>
            <span>Interceptor</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LegendItemProps {
  color: string;
  label: string;
  dashed?: boolean;
  glow?: boolean;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, dashed, glow }) => (
  <div className="flex items-center gap-2">
    <div 
      className={`w-4 h-3 rounded-sm ${color} ${dashed ? 'border border-dashed border-current' : ''} ${glow ? 'animate-pulse' : ''}`}
    />
    <span className="text-muted-foreground">{label}</span>
  </div>
);

export default Legend;
