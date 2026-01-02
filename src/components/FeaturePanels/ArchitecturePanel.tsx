import React from 'react';
import { Radar, Radio, Brain, Shield, Eye, Zap, Network, Target } from 'lucide-react';

const ArchitecturePanel: React.FC = () => {
  return (
    <div className="space-y-3">
      {/* Architecture Flow Diagram */}
      <div className="grid grid-cols-2 gap-2">
        <ArchitectureNode
          icon={Eye}
          title="SENSE"
          subtitle="Perception"
          items={['Radar Detection', 'Signal Analysis', 'Threat Scanning', 'GPS Monitoring']}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/30"
        />
        <ArchitectureNode
          icon={Network}
          title="COMMUNICATE"
          subtitle="Mesh Network"
          items={['Peer-to-Peer', 'Self-Healing', 'Data Relay', 'Fallback Modes']}
          color="text-green-400"
          bgColor="bg-green-500/10"
          borderColor="border-green-500/30"
        />
        <ArchitectureNode
          icon={Brain}
          title="DECIDE"
          subtitle="AI Engine"
          items={['Threat Analysis', 'Role Assignment', 'Path Planning', 'Priority Ranking']}
          color="text-amber-400"
          bgColor="bg-amber-500/10"
          borderColor="border-amber-500/30"
        />
        <ArchitectureNode
          icon={Shield}
          title="SURVIVE"
          subtitle="Resilience"
          items={['Jamming Evasion', 'GPS-Denied Nav', 'Formation Adapt', 'Mission Continuity']}
          color="text-red-400"
          bgColor="bg-red-500/10"
          borderColor="border-red-500/30"
        />
      </div>

      {/* Key Algorithms */}
      <div className="space-y-2">
        <AlgorithmCard
          icon={Radar}
          title="Inertial Navigation"
          description="Dead reckoning using velocity vectors when GPS unavailable"
        />
        <AlgorithmCard
          icon={Radio}
          title="Mesh Routing"
          description="Dynamic peer discovery with automatic rerouting on node loss"
        />
        <AlgorithmCard
          icon={Target}
          title="Threat Prioritization"
          description="Multi-factor scoring: proximity, velocity, type classification"
        />
        <AlgorithmCard
          icon={Zap}
          title="Jamming Response"
          description="Signal degradation detection with fallback protocol activation"
        />
      </div>
    </div>
  );
};

interface ArchitectureNodeProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  items: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

const ArchitectureNode: React.FC<ArchitectureNodeProps> = ({
  icon: Icon,
  title,
  subtitle,
  items,
  color,
  bgColor,
  borderColor,
}) => {
  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-3 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${borderColor} rounded-tl-lg`} />
      <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${borderColor} rounded-br-lg`} />
      
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <div>
          <div className={`text-[10px] font-tactical ${color}`}>{title}</div>
          <div className="text-[9px] text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      
      <div className="space-y-0.5">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <div className={`w-1 h-1 rounded-full ${color.replace('text-', 'bg-')}`} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface AlgorithmCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="bg-card/30 border border-border/30 rounded p-2 flex items-start gap-2">
      <Icon className="w-3 h-3 text-primary shrink-0 mt-0.5" />
      <div>
        <span className="text-[10px] font-tactical text-foreground">{title}</span>
        <p className="text-[9px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default ArchitecturePanel;
