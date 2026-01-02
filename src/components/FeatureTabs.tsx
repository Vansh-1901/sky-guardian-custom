import React, { useState } from 'react';
import { Layers, Brain, Radio, Navigation, AlertTriangle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ArchitecturePanel from './FeaturePanels/ArchitecturePanel';
import AlgorithmsPanel from './FeaturePanels/AlgorithmsPanel';
import CommunicationPanel from './FeaturePanels/CommunicationPanel';
import NavigationPanel from './FeaturePanels/NavigationPanel';
import ThreatPanel from './FeaturePanels/ThreatPanel';
import AIPanel from './FeaturePanels/AIPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drone, Target } from '@/types/drone';

const tabs = [
  { id: 'ai', label: 'AI', icon: Sparkles },
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
  const [activeTab, setActiveTab] = useState<TabId>('ai');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderPanel = () => {
    switch (activeTab) {
      case 'ai':
        return <AIPanel drones={drones} targets={targets} />;
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
        return <AIPanel drones={drones} targets={targets} />;
    }
  };

  if (isCollapsed) {
    return (
      <div className="tactical-panel p-2 flex flex-col items-center gap-2">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1 hover:bg-primary/10 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-primary" />
        </button>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setIsCollapsed(false);
            }}
            className={`p-2 rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
            }`}
            title={tab.label}
          >
            <tab.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="tactical-panel p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-tactical text-sm text-primary tracking-wider">
          SYSTEM FEATURES
        </h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-primary/10 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
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
      <ScrollArea className="h-[calc(100vh-380px)] pr-2">
        {renderPanel()}
      </ScrollArea>
    </div>
  );
};

export default FeatureTabs;
