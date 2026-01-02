import React from 'react';
import { Radar, Radio, Brain, Shield, Eye, Zap, Network, Target } from 'lucide-react';

const ArchitecturePanel: React.FC = () => {
  return (
    <div className="tactical-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-tactical text-sm text-primary tracking-wider">
          SYSTEM ARCHITECTURE
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">LIVE</span>
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {/* Sense */}
        <ArchitectureNode
          icon={Eye}
          title="SENSE"
          subtitle="Perception"
          items={['Radar Detection', 'Signal Analysis', 'Threat Scanning', 'GPS Monitoring']}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          borderColor="border-blue-500/30"
        />

        {/* Communicate */}
        <ArchitectureNode
          icon={Network}
          title="COMMUNICATE"
          subtitle="Mesh Network"
          items={['Peer-to-Peer', 'Self-Healing', 'Data Relay', 'Fallback Modes']}
          color="text-green-400"
          bgColor="bg-green-500/10"
          borderColor="border-green-500/30"
        />

        {/* Decide */}
        <ArchitectureNode
          icon={Brain}
          title="DECIDE"
          subtitle="AI Engine"
          items={['Threat Analysis', 'Role Assignment', 'Path Planning', 'Priority Ranking']}
          color="text-amber-400"
          bgColor="bg-amber-500/10"
          borderColor="border-amber-500/30"
        />

        {/* Survive */}
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

      {/* Flow Arrows */}
      <div className="relative h-6 mb-4">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-blue-500 via-green-500 via-amber-500 to-red-500 opacity-50" />
        <div className="absolute inset-x-0 top-1/2 flex justify-between px-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative">
              <div className="w-3 h-3 rotate-45 border-t-2 border-r-2 border-primary/50 animate-pulse" 
                   style={{ animationDelay: `${i * 0.3}s` }} />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="h-1 bg-gradient-to-r from-blue-500/0 via-primary/50 to-red-500/0 animate-data-flow" />
        </div>
      </div>

      {/* Key Algorithms */}
      <div className="grid grid-cols-2 gap-2">
        <AlgorithmCard
          icon={Radar}
          title="Inertial Navigation"
          description="Dead reckoning using velocity vectors when GPS unavailable"
          status="ACTIVE"
        />
        <AlgorithmCard
          icon={Radio}
          title="Mesh Routing"
          description="Dynamic peer discovery with automatic rerouting on node loss"
          status="ACTIVE"
        />
        <AlgorithmCard
          icon={Target}
          title="Threat Prioritization"
          description="Multi-factor scoring: proximity, velocity, type classification"
          status="ACTIVE"
        />
        <AlgorithmCard
          icon={Zap}
          title="Jamming Response"
          description="Signal degradation detection with fallback protocol activation"
          status="ACTIVE"
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
      {/* Animated corner accent */}
      <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${borderColor} rounded-tl-lg`} />
      <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${borderColor} rounded-br-lg`} />
      
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <div>
          <div className={`text-xs font-tactical ${color}`}>{title}</div>
          <div className="text-[10px] text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      
      <div className="space-y-1">
        {items.map((item, index) => (
          <div 
            key={item} 
            className="flex items-center gap-1 text-[10px] text-muted-foreground animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
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
  status: string;
}

const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  icon: Icon,
  title,
  description,
  status,
}) => {
  return (
    <div className="bg-card/30 border border-border/30 rounded p-2 relative">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-3 h-3 text-primary" />
          <span className="text-xs font-tactical text-foreground">{title}</span>
        </div>
        <span className="text-[9px] text-primary font-mono bg-primary/10 px-1 rounded">
          {status}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default ArchitecturePanel;
