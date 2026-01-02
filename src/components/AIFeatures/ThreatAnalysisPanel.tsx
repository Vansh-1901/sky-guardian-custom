import React, { useState } from 'react';
import { Brain, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAISwarm } from '@/hooks/useAISwarm';
import { Drone, Target } from '@/types/drone';

interface ThreatAnalysisPanelProps {
  drones: Drone[];
  targets: Target[];
}

const ThreatAnalysisPanel: React.FC<ThreatAnalysisPanelProps> = ({ drones, targets }) => {
  const { analyzeThreat, isAnalyzing } = useAISwarm();
  const [analysis, setAnalysis] = useState<{
    threatLevel: string;
    assessment: string;
    recommendedAction: string;
  } | null>(null);

  const handleAnalyze = async () => {
    const threatData = {
      activeDrones: drones.filter(d => d.status === 'active').length,
      jammedDrones: drones.filter(d => d.status === 'jammed').length,
      targets: targets.map(t => ({ type: t.type, tracked: t.tracked })),
      highThreatDrones: drones.filter(d => d.threatLevel === 'high' || d.threatLevel === 'critical').length,
    };

    const result = await analyzeThreat(threatData);
    if (result) {
      setAnalysis(result);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/20';
      case 'LOW': return 'text-green-500 bg-green-500/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="bg-card/30 border border-border/30 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-tactical text-foreground">AI THREAT ANALYSIS</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="h-6 text-[10px] px-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ANALYZING
            </>
          ) : (
            <>
              <Shield className="w-3 h-3 mr-1" />
              ANALYZE
            </>
          )}
        </Button>
      </div>

      {analysis ? (
        <div className="space-y-2">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${getThreatColor(analysis.threatLevel)}`}>
            <AlertTriangle className="w-3 h-3" />
            {analysis.threatLevel}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">
              <span className="text-foreground font-medium">Assessment:</span> {analysis.assessment}
            </p>
            <p className="text-[10px] text-muted-foreground">
              <span className="text-foreground font-medium">Action:</span> {analysis.recommendedAction}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground italic">
          Click ANALYZE to get AI-powered threat assessment
        </p>
      )}
    </div>
  );
};

export default ThreatAnalysisPanel;
