import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ThreatAnalysis {
  threatLevel: string;
  assessment: string;
  recommendedAction: string;
}

interface CommandResult {
  action: string;
  target: string;
  parameters: Record<string, unknown>;
}

interface OptimizationSuggestion {
  priority: string;
  suggestion: string;
  impact: string;
}

export const useAISwarm = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const analyzeThreat = async (threatData: Record<string, unknown>): Promise<ThreatAnalysis | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-swarm', {
        body: { type: 'threat-analysis', data: threatData },
      });

      if (error) throw error;

      const result = data.result;
      const lines = result.split('\n').filter((l: string) => l.trim());
      
      let threatLevel = 'UNKNOWN';
      let assessment = '';
      let recommendedAction = '';

      for (const line of lines) {
        if (line.includes('THREAT LEVEL:')) {
          threatLevel = line.split(':')[1]?.trim() || 'UNKNOWN';
        } else if (line.includes('ASSESSMENT:')) {
          assessment = line.split(':').slice(1).join(':').trim();
        } else if (line.includes('RECOMMENDED ACTION:')) {
          recommendedAction = line.split(':').slice(1).join(':').trim();
        }
      }

      return { threatLevel, assessment, recommendedAction };
    } catch (error) {
      console.error('Threat analysis error:', error);
      toast.error('Failed to analyze threat');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processCommand = async (command: string): Promise<CommandResult | null> => {
    setIsProcessingCommand(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-swarm', {
        body: { type: 'natural-command', data: { command } },
      });

      if (error) throw error;

      const result = data.result;
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid command response');
    } catch (error) {
      console.error('Command processing error:', error);
      toast.error('Failed to process command');
      return null;
    } finally {
      setIsProcessingCommand(false);
    }
  };

  const getOptimizations = async (swarmData: Record<string, unknown>): Promise<OptimizationSuggestion[]> => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-swarm', {
        body: { type: 'swarm-optimization', data: swarmData },
      });

      if (error) throw error;

      const result = data.result;
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Failed to get optimizations');
      return [];
    } finally {
      setIsOptimizing(false);
    }
  };

  return {
    analyzeThreat,
    processCommand,
    getOptimizations,
    isAnalyzing,
    isProcessingCommand,
    isOptimizing,
  };
};
