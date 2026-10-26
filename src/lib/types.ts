export interface ChargingLog {
  id: number;
  soc: number;
  temperature: number;
  gridLoad: number;
  chargingRate: number;
  explanation: string;
  isAnomaly?: boolean;
  anomalyReasons?: string[];
  riskScore?: number;
  edgeAnomalyScore?: number;
}

export interface AuditSummary {
  totalLogs: number;
  anomalyCount: number;
  avgChargingRate: number;
  avgSoC: number;
  avgTemperature: number;
  avgGridLoad: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  tamperingAlerts: string[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}


export interface EdgeAIMetrics {
  model: string;
  analyzed: number;
  edgeAnomalies: number;
  averageScore: number;
  localInference: boolean;
}

export interface OptimizationRecommendation {
  logId: number;
  currentRate: number;
  recommendedRate: number;
  reduction: number;
  reason: string;
}

export interface OptimizationResult {
  gridCapacity: number;
  currentLoad: number;
  optimizedLoad: number;
  reductionPercent: number;
  recommendations: OptimizationRecommendation[];
}
