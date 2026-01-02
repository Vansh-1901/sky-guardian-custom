import React from 'react';
import { Brain, GitBranch, Workflow, Cpu } from 'lucide-react';

const AlgorithmsPanel: React.FC = () => {
  return (
    <div className="space-y-3">
      <AlgorithmBlock
        icon={Brain}
        title="Decision Tree Algorithm"
        description="Each drone uses a priority-based decision tree that evaluates threats, mission objectives, and swarm state."
        steps={[
          'Evaluate threat proximity & severity',
          'Check communication status',
          'Assess battery & capability',
          'Select optimal action from weighted options',
        ]}
      />
      
      <AlgorithmBlock
        icon={GitBranch}
        title="Role Assignment Logic"
        description="Dynamic role reassignment based on swarm needs and individual drone capabilities."
        steps={[
          'Scout: Low battery drones patrol perimeter',
          'Relay: Central drones boost mesh coverage',
          'Tracker: High-capability drones pursue targets',
          'Interceptor: Armed drones engage threats',
        ]}
      />
      
      <AlgorithmBlock
        icon={Workflow}
        title="Behavior State Machine"
        description="Finite state machine governing drone operational modes."
        steps={[
          'PATROL → ALERT (threat detected)',
          'ALERT → ENGAGED (threat confirmed)',
          'ENGAGED → EVADING (under attack)',
          'EVADING → PATROL (threat cleared)',
        ]}
      />
      
      <AlgorithmBlock
        icon={Cpu}
        title="Swarm Consensus"
        description="Decentralized voting mechanism for collective decisions."
        steps={[
          'Broadcast local threat assessment',
          'Receive peer assessments via mesh',
          'Weight votes by proximity & confidence',
          'Execute majority decision',
        ]}
      />
    </div>
  );
};

interface AlgorithmBlockProps {
  icon: React.ElementType;
  title: string;
  description: string;
  steps: string[];
}

const AlgorithmBlock: React.FC<AlgorithmBlockProps> = ({
  icon: Icon,
  title,
  description,
  steps,
}) => {
  return (
    <div className="bg-card/30 border border-border/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-tactical text-foreground">{title}</h3>
      </div>
      <p className="text-[10px] text-muted-foreground mb-2">{description}</p>
      <div className="space-y-1 pl-2 border-l border-primary/30">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-2 text-[10px]">
            <span className="text-primary font-mono">{index + 1}.</span>
            <span className="text-muted-foreground">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlgorithmsPanel;
