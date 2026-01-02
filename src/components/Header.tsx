import React from 'react';
import { Shield, Radar, Radio, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="tactical-panel px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Shield className="w-10 h-10 text-primary" />
            <Radar className="w-5 h-5 text-tactical-green absolute -bottom-1 -right-1" />
          </div>
          <div>
            <h1 className="font-tactical text-2xl text-primary tracking-wider tactical-text">
              SKY-SHIELD
            </h1>
            <p className="text-xs text-muted-foreground tracking-widest">
              AUTONOMOUS ANTI-JAMMING DRONE SWARM SIMULATION
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
            <Radio className="w-4 h-4 text-tactical-green animate-pulse" />
            <span className="text-xs text-muted-foreground">COMMS ACTIVE</span>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-muted-foreground">SYSTEM TIME</div>
            <div className="font-tactical text-lg text-primary tracking-wider">
              {currentTime}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-tactical-green animate-pulse" />
            <span className="text-xs text-tactical-green">ONLINE</span>
          </div>

          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-border/50">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">OPERATOR</div>
                <div className="text-xs text-foreground truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-tactical-red"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
