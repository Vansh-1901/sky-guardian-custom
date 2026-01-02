import React, { useState } from 'react';
import { Layers, Brain, Radio, Navigation, AlertTriangle } from 'lucide-react';
import ArchitecturePanel from './FeaturePanels/ArchitecturePanel';
import AlgorithmsPanel from './FeaturePanels/AlgorithmsPanel';
import CommunicationPanel from './FeaturePanels/CommunicationPanel';
import NavigationPanel from './FeaturePanels/NavigationPanel';
import ThreatPanel from './FeaturePanels/ThreatPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drone, Target } from '@/types/drone';

const tabs = [
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'algorithms', label: 'Algorithms', icon: Brain },
  { id: 'communication', label: 'Comms', icon: Radio },
  { id: 'navigation', label: 'Navigation', icon: Navigation },
  { id: 'threats', label: 'Threats', icon: AlertTriangle },
] as const;

type TabId = typeof tabs[number]['id'];

interface FeatureTabsProps {
  drones?: Drone[];
  targets?: Target[];
}

const FeatureTabs: React.FC<FeatureTabsProps> = ({ drones = [], targets = [] }) => {
  const [activeTab, setActiveTab] = useState<TabId>('architecture');

  const renderPanel = () => {
    switch (activeTab) {
      case 'architecture':
        return <ArchitecturePanel />;
      case 'algorithms':
        return <AlgorithmsPanel />;
      case 'communication':
        return <CommunicationPanel />;
      case 'navigation':
        return <NavigationPanel />;
      case 'threats':
        return <ThreatPanel />;
      default:
        return <ArchitecturePanel />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-tactical whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 border border-transparent'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <ScrollArea className="h-[60vh] pr-2">
        {renderPanel()}
      </ScrollArea>
    </div>
  );
};

export default FeatureTabs;
