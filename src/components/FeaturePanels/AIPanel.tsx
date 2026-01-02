import React, { useState } from 'react';
import { Shield, Terminal, Zap } from 'lucide-react';
import ThreatAnalysisPanel from '@/components/AIFeatures/ThreatAnalysisPanel';
import CommandInput from '@/components/AIFeatures/CommandInput';
import OptimizationPanel from '@/components/AIFeatures/OptimizationPanel';
import { Drone, Target } from '@/types/drone';

interface AIPanelProps {
  drones: Drone[];
  targets: Target[];
}

const aiTabs = [
  { id: 'threats', label: 'Threat Analysis', icon: Shield },
  { id: 'commands', label: 'Commands', icon: Terminal },
  { id: 'optimize', label: 'Optimization', icon: Zap },
] as const;

type AITabId = typeof aiTabs[number]['id'];

const AIPanel: React.FC<AIPanelProps> = ({ drones, targets }) => {
  const [activeTab, setActiveTab] = useState<AITabId>('threats');

  const renderPanel = () => {
    switch (activeTab) {
      case 'threats':
        return <ThreatAnalysisPanel drones={drones} targets={targets} />;
      case 'commands':
        return <CommandInput />;
      case 'optimize':
        return <OptimizationPanel drones={drones} />;
      default:
        return <ThreatAnalysisPanel drones={drones} targets={targets} />;
    }
  };

  return (
    <div className="space-y-3">
      {/* AI Sub-tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {aiTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-tactical whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-chart-4/20 text-chart-4 border border-chart-4/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-chart-4/10 border border-transparent'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      {renderPanel()}
    </div>
  );
};

export default AIPanel;
