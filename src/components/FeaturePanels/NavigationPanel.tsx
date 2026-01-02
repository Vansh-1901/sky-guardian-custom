import React from 'react';
import { Navigation, Compass, MapPin, Route, Satellite, SatelliteIcon } from 'lucide-react';

const NavigationPanel: React.FC = () => {
  return (
    <div className="space-y-3">
      {/* GPS vs Inertial */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <Satellite className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-tactical text-foreground">NAVIGATION MODES</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SatelliteIcon className="w-3 h-3 text-tactical-green" />
              <span className="text-[10px] font-tactical text-tactical-green">GPS MODE</span>
            </div>
            <ul className="space-y-1 text-[9px] text-muted-foreground pl-2">
              <li>• Absolute positioning</li>
              <li>• High accuracy (±2m)</li>
              <li>• Low computation</li>
              <li>• Vulnerable to jamming</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Compass className="w-3 h-3 text-tactical-amber" />
              <span className="text-[10px] font-tactical text-tactical-amber">INERTIAL MODE</span>
            </div>
            <ul className="space-y-1 text-[9px] text-muted-foreground pl-2">
              <li>• Dead reckoning</li>
              <li>• Moderate accuracy (±15m)</li>
              <li>• Drift accumulation</li>
              <li>• Jam-resistant</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Inertial Navigation Process */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Route className="w-4 h-4 text-tactical-amber" />
          <h3 className="text-xs font-tactical text-foreground">DEAD RECKONING ALGORITHM</h3>
        </div>
        
        <div className="space-y-2 text-[10px]">
          <div className="bg-background/30 rounded p-2 font-mono text-tactical-cyan">
            Position(t+1) = Position(t) + Velocity × Δt
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-background/20 rounded p-2">
              <div className="text-muted-foreground mb-1">Inputs:</div>
              <ul className="text-[9px] space-y-0.5">
                <li>• Last known position</li>
                <li>• Velocity vector</li>
                <li>• Heading (compass)</li>
                <li>• Time delta</li>
              </ul>
            </div>
            <div className="bg-background/20 rounded p-2">
              <div className="text-muted-foreground mb-1">Corrections:</div>
              <ul className="text-[9px] space-y-0.5">
                <li>• Peer triangulation</li>
                <li>• Landmark detection</li>
                <li>• Velocity calibration</li>
                <li>• Drift compensation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Waypoint System */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-tactical text-foreground">ADAPTIVE PATH PLANNING</h3>
        </div>
        
        <div className="space-y-2 text-[10px]">
          {[
            { trigger: 'Obstacle Detected', action: 'Recompute path avoiding zone' },
            { trigger: 'Jamming Zone Entry', action: 'Switch to inertial, minimize exposure' },
            { trigger: 'Target Acquired', action: 'Intercept trajectory calculation' },
            { trigger: 'Low Battery', action: 'Optimize return path' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Navigation className="w-3 h-3 text-primary shrink-0" />
              <span className="text-tactical-amber">{item.trigger}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-muted-foreground">{item.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel;
