import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChargingLog, AuditSummary, FeatureImportance, EdgeAIMetrics, OptimizationResult } from '@/lib/types';
import { parseCSV } from '@/lib/csvParser';
import { analyzeLogs, generateSummary, getFeatureImportance } from '@/lib/anomalyEngine';
import { runEdgeAI, getEdgeAIMetrics } from '@/lib/edgeAI';
import { optimizeCharging } from '@/lib/optimizer';

interface DataContextType {
  logs: ChargingLog[];
  summary: AuditSummary | null;
  featureImportance: FeatureImportance[];
  edgeAIMetrics: EdgeAIMetrics | null;
  optimization: OptimizationResult | null;
  isLoaded: boolean;
  loadCSV: (text: string) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ChargingLog[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [edgeAIMetrics, setEdgeAIMetrics] = useState<EdgeAIMetrics | null>(null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);

  const loadCSV = useCallback((text: string) => {
    const parsed = parseCSV(text);
    const ruleAnalyzed = analyzeLogs(parsed);
    const analyzed = runEdgeAI(ruleAnalyzed);
    setLogs(analyzed);
    setSummary(generateSummary(analyzed));
    setFeatureImportance(getFeatureImportance(analyzed));
    setEdgeAIMetrics(getEdgeAIMetrics(analyzed));
    setOptimization(optimizeCharging(analyzed));
    setIsLoaded(true);
  }, []);

  const clearData = useCallback(() => {
    setLogs([]);
    setSummary(null);
    setFeatureImportance([]);
    setIsLoaded(false);
    setEdgeAIMetrics(null);
    setOptimization(null);
  }, []);

  return (
    <DataContext.Provider value={{ logs, summary, featureImportance, edgeAIMetrics, optimization, isLoaded, loadCSV, clearData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
