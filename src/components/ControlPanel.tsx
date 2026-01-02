import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Satellite, Radio, AlertTriangle } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  gpsEnabled: boolean;
  jammingActive: boolean;
  onToggleSimulation: () => void;
  onToggleGPS: () => void;
  onToggleJamming: () => void;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  gpsEnabled,
  jammingActive,
  onToggleSimulation,
  onToggleGPS,
  onToggleJamming,
  onReset,
}) => {
  return (
    <div className="tactical-panel p-4 space-y-4">
      <h2 className="font-tactical text-sm text-primary tracking-wider border-b border-border pb-3">
        MISSION CONTROL
      </h2>

      <div className="space-y-3">
        <Button
          onClick={onToggleSimulation}
          className={`w-full ${isRunning 
            ? 'bg-tactical-amber/20 text-tactical-amber border-tactical-amber hover:bg-tactical-amber/30' 
            : 'bg-tactical-green/20 text-tactical-green border-tactical-green hover:bg-tactical-green/30'
          } border`}
          variant="outline"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              PAUSE MISSION
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              START MISSION
            </>
          )}
        </Button>

        <Button
          onClick={onReset}
          className="w-full bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground border"
          variant="outline"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          RESET
        </Button>
      </div>

      <div className="pt-3 border-t border-border space-y-3">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Scenario Controls</h3>
        
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Satellite className={`w-4 h-4 ${gpsEnabled ? 'text-tactical-green' : 'text-tactical-red'}`} />
            <div>
              <div className="text-sm">GPS Signal</div>
              <div className="text-xs text-muted-foreground">
                {gpsEnabled ? 'Available' : 'Denied'}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleGPS}
            className={`${gpsEnabled 
              ? 'border-tactical-green text-tactical-green hover:bg-tactical-green/20' 
              : 'border-tactical-red text-tactical-red hover:bg-tactical-red/20'
            }`}
          >
            {gpsEnabled ? 'ENABLED' : 'DENIED'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${jammingActive ? 'text-tactical-red' : 'text-tactical-green'}`} />
            <div>
              <div className="text-sm">Enemy Jamming</div>
              <div className="text-xs text-muted-foreground">
                {jammingActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleJamming}
            className={`${jammingActive 
              ? 'border-tactical-red text-tactical-red hover:bg-tactical-red/20' 
              : 'border-tactical-green text-tactical-green hover:bg-tactical-green/20'
            }`}
          >
            {jammingActive ? 'ACTIVE' : 'OFF'}
          </Button>
        </div>
      </div>

      {jammingActive && (
        <div className="flex items-center gap-2 p-3 bg-tactical-red/10 border border-tactical-red/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-tactical-red animate-pulse" />
          <span className="text-xs text-tactical-red">
            Electronic warfare detected in AO
          </span>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
