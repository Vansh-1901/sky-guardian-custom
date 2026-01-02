import React from 'react';
import { AlertTriangle, Target, Crosshair, ShieldAlert, Zap, Eye } from 'lucide-react';

const ThreatPanel: React.FC = () => {
  return (
    <div className="space-y-3">
      {/* Threat Classification */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-tactical-red" />
          <h3 className="text-xs font-tactical text-foreground">THREAT CLASSIFICATION</h3>
        </div>
        
        <div className="space-y-2">
          {[
            { level: 'CRITICAL', color: 'bg-tactical-red', desc: 'Active engagement, immediate response' },
            { level: 'HIGH', color: 'bg-orange-500', desc: 'Confirmed hostile, tracking required' },
            { level: 'MEDIUM', color: 'bg-tactical-amber', desc: 'Unidentified, monitoring active' },
            { level: 'LOW', color: 'bg-tactical-green', desc: 'Known entity, passive observation' },
          ].map((threat) => (
            <div key={threat.level} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${threat.color}`} />
              <span className="text-[10px] font-tactical text-foreground w-16">{threat.level}</span>
              <span className="text-[9px] text-muted-foreground">{threat.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detection Pipeline */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-tactical-cyan" />
          <h3 className="text-xs font-tactical text-foreground">DETECTION PIPELINE</h3>
        </div>
        
        <div className="flex items-center justify-between text-[9px]">
          {['Sense', 'Classify', 'Track', 'Decide', 'Act'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
                  {i + 1}
                </div>
                <span className="text-muted-foreground">{step}</span>
              </div>
              {i < 4 && <div className="w-4 h-px bg-primary/30" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Response Protocols */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-tactical-amber" />
          <h3 className="text-xs font-tactical text-foreground">RESPONSE PROTOCOLS</h3>
        </div>
        
        <div className="space-y-2">
          {[
            { icon: Crosshair, name: 'INTERCEPT', desc: 'Engage and neutralize confirmed threats' },
            { icon: Target, name: 'TRACK', desc: 'Maintain visual and coordinate with swarm' },
            { icon: Zap, name: 'EVADE', desc: 'Break contact and reposition safely' },
            { icon: ShieldAlert, name: 'DEFEND', desc: 'Protect high-value assets in formation' },
          ].map((protocol) => (
            <div key={protocol.name} className="flex items-start gap-2 bg-background/20 rounded p-2">
              <protocol.icon className="w-3 h-3 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-tactical text-foreground">{protocol.name}</div>
                <div className="text-[9px] text-muted-foreground">{protocol.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Swarm Coordination */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-tactical text-foreground">COOPERATIVE TARGETING</h3>
        </div>
        
        <div className="text-[10px] text-muted-foreground space-y-1">
          <p>Multiple drones coordinate to triangulate and engage threats:</p>
          <ul className="pl-3 space-y-0.5">
            <li>• Primary tracker maintains lock</li>
            <li>• Secondary drones provide angle coverage</li>
            <li>• Interceptor receives consolidated targeting</li>
            <li>• Swarm redistributes on neutralization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThreatPanel;
