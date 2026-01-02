import React from 'react';
import ThreatAnalysisPanel from '@/components/AIFeatures/ThreatAnalysisPanel';
import CommandInput from '@/components/AIFeatures/CommandInput';
import OptimizationPanel from '@/components/AIFeatures/OptimizationPanel';
import { Drone, Target } from '@/types/drone';

interface AIPanelProps {
  drones: Drone[];
  targets: Target[];
}

const AIPanel: React.FC<AIPanelProps> = ({ drones, targets }) => {
  return (
    <div className="space-y-3">
      <ThreatAnalysisPanel drones={drones} targets={targets} />
      <CommandInput />
      <OptimizationPanel drones={drones} />
    </div>
  );
};

export default AIPanel;
