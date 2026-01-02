import React, { useState } from 'react';
import { Terminal, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAISwarm } from '@/hooks/useAISwarm';
import { toast } from 'sonner';

interface CommandInputProps {
  onCommandExecuted?: (action: string, target: string) => void;
}

const CommandInput: React.FC<CommandInputProps> = ({ onCommandExecuted }) => {
  const { processCommand, isProcessingCommand } = useAISwarm();
  const [command, setCommand] = useState('');
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    action: string;
    target: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isProcessingCommand) return;

    const result = await processCommand(command);
    if (result) {
      setLastResult({
        success: true,
        action: result.action,
        target: result.target,
      });
      toast.success(`Command executed: ${result.action} → ${result.target}`);
      onCommandExecuted?.(result.action, result.target);
    } else {
      setLastResult({
        success: false,
        action: 'FAILED',
        target: command,
      });
    }
    setCommand('');
  };

  const exampleCommands = [
    'Deploy all scouts to north sector',
    'Recall interceptors to base',
    'Form defensive perimeter',
    'Track hostile target alpha',
  ];

  return (
    <div className="bg-card/30 border border-border/30 rounded-lg p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Terminal className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-tactical text-foreground">NATURAL LANGUAGE COMMAND</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter tactical command..."
          className="h-8 text-xs bg-background/50 border-border/50"
          disabled={isProcessingCommand}
        />
        <Button
          type="submit"
          size="sm"
          disabled={isProcessingCommand || !command.trim()}
          className="h-8 px-3"
        >
          {isProcessingCommand ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
        </Button>
      </form>

      {lastResult && (
        <div className={`flex items-center gap-2 text-[10px] ${lastResult.success ? 'text-green-500' : 'text-red-500'}`}>
          {lastResult.success ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          <span>
            {lastResult.success 
              ? `${lastResult.action} → ${lastResult.target}` 
              : 'Command not recognized'}
          </span>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground font-medium">Examples:</p>
        <div className="flex flex-wrap gap-1">
          {exampleCommands.map((cmd, i) => (
            <button
              key={i}
              onClick={() => setCommand(cmd)}
              className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandInput;
