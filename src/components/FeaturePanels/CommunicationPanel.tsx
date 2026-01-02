import React from 'react';
import { Radio, Wifi, WifiOff, RefreshCw, Link2, Unlink } from 'lucide-react';

const CommunicationPanel: React.FC = () => {
  return (
    <div className="space-y-3">
      {/* Mesh Network Diagram */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-tactical-green" />
          <h3 className="text-xs font-tactical text-foreground">MESH NETWORK TOPOLOGY</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="space-y-1">
            <div className="w-8 h-8 mx-auto rounded-full bg-tactical-green/20 border border-tactical-green/50 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-tactical-green" />
            </div>
            <span className="text-muted-foreground">Active Node</span>
          </div>
          <div className="space-y-1">
            <div className="w-8 h-8 mx-auto rounded-full bg-tactical-amber/20 border border-tactical-amber/50 flex items-center justify-center">
              <WifiOff className="w-4 h-4 text-tactical-amber" />
            </div>
            <span className="text-muted-foreground">Jammed Node</span>
          </div>
          <div className="space-y-1">
            <div className="w-8 h-8 mx-auto rounded-full bg-tactical-red/20 border border-tactical-red/50 flex items-center justify-center">
              <Unlink className="w-4 h-4 text-tactical-red" />
            </div>
            <span className="text-muted-foreground">Disconnected</span>
          </div>
        </div>
      </div>

      {/* Self-Healing Process */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-4 h-4 text-tactical-cyan" />
          <h3 className="text-xs font-tactical text-foreground">SELF-HEALING PROTOCOL</h3>
        </div>
        
        <div className="space-y-2">
          {[
            { step: 1, label: 'Detect Link Loss', desc: 'Heartbeat timeout after 2 cycles' },
            { step: 2, label: 'Broadcast Discovery', desc: 'Ping all nodes in range' },
            { step: 3, label: 'Route Calculation', desc: 'Find shortest alternate path' },
            { step: 4, label: 'Link Establishment', desc: 'Handshake with new relay node' },
            { step: 5, label: 'Data Rerouting', desc: 'Resume mission data flow' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-[9px] font-mono text-primary">
                {item.step}
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-foreground">{item.label}</div>
                <div className="text-[9px] text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Modes */}
      <div className="bg-card/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-tactical text-foreground">FALLBACK MODES</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {[
            { mode: 'Primary', status: 'Full Mesh', color: 'text-tactical-green' },
            { mode: 'Fallback 1', status: 'Reduced Mesh', color: 'text-tactical-amber' },
            { mode: 'Fallback 2', status: 'Direct P2P', color: 'text-tactical-amber' },
            { mode: 'Emergency', status: 'Broadcast Only', color: 'text-tactical-red' },
          ].map((item) => (
            <div key={item.mode} className="flex items-center justify-between text-[10px] bg-background/30 rounded px-2 py-1">
              <span className="text-muted-foreground">{item.mode}</span>
              <span className={item.color}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunicationPanel;
