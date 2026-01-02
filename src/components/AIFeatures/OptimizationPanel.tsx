import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAISwarm } from '@/hooks/useAISwarm';
import { Drone } from '@/types/drone';

interface OptimizationPanelProps {
  drones: Drone[];
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ drones }) => {
  const { getOptimizations, isOptimizing } = useAISwarm();
  const [suggestions, setSuggestions] = useState<Array<{
    priority: string;
    suggestion: string;
    impact: string;
  }>>([]);

  const handleOptimize = async () => {
    const swarmData = {
      totalDrones: drones.length,
      byRole: {
        scouts: drones.filter(d => d.role === 'scout').length,
        relays: drones.filter(d => d.role === 'relay').length,
        trackers: drones.filter(d => d.role === 'tracker').length,
        interceptors: drones.filter(d => d.role === 'interceptor').length,
      },
      byStatus: {
        active: drones.filter(d => d.status === 'active').length,
        jammed: drones.filter(d => d.status === 'jammed').length,
        offline: drones.filter(d => d.status === 'offline').length,
      },
      avgBattery: drones.reduce((acc, d) => acc + d.battery, 0) / drones.length,
      connectedDrones: drones.filter(d => d.connectedPeers.length > 0).length,
    };

    const result = await getOptimizations(swarmData);
    setSuggestions(result);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH': return <ArrowUp className="w-3 h-3 text-red-500" />;
      case 'MEDIUM': return <ArrowRight className="w-3 h-3 text-yellow-500" />;
      case 'LOW': return <ArrowDown className="w-3 h-3 text-green-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH': return 'border-red-500/30 bg-red-500/5';
      case 'MEDIUM': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'LOW': return 'border-green-500/30 bg-green-500/5';
      default: return 'border-border/30 bg-card/30';
    }
  };

  return (
    <div className="bg-card/30 border border-border/30 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-tactical text-foreground">SWARM OPTIMIZATION</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="h-6 text-[10px] px-2"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              OPTIMIZING
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 mr-1" />
              OPTIMIZE
            </>
          )}
        </Button>
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className={`p-2 rounded border ${getPriorityColor(s.priority)}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getPriorityIcon(s.priority)}
                <span className="text-[10px] font-bold text-foreground">{s.priority}</span>
              </div>
              <p className="text-[10px] text-foreground">{s.suggestion}</p>
              <p className="text-[9px] text-muted-foreground mt-1">Impact: {s.impact}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground italic">
          Click OPTIMIZE for AI-powered swarm improvements
        </p>
      )}
    </div>
  );
};

export default OptimizationPanel;
