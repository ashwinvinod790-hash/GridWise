import { ChargingLog, EdgeAIMetrics } from './types';

function mean(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function std(values: number[], avg: number) {
  if (values.length < 2) return 1;
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance) || 1;
}

/**
 * Lightweight local/edge anomaly inference.
 * No cloud API or external model is required: the browser builds a baseline
 * from the uploaded charging logs and scores each record against it.
 */
export function runEdgeAI(logs: ChargingLog[]): ChargingLog[] {
  if (!logs.length) return [];

  const features = {
    soc: logs.map(l => l.soc),
    temperature: logs.map(l => l.temperature),
    gridLoad: logs.map(l => l.gridLoad),
    chargingRate: logs.map(l => l.chargingRate),
  };

  const stats = Object.fromEntries(
    Object.entries(features).map(([key, values]) => {
      const avg = mean(values);
      return [key, { avg, sd: std(values, avg) }];
    }),
  ) as Record<keyof typeof features, { avg: number; sd: number }>;

  return logs.map(log => {
    const z = (value: number, key: keyof typeof features) =>
      Math.min(4, Math.abs(value - stats[key].avg) / stats[key].sd);

    // Weighted local anomaly model. Larger deviations contribute more.
    const weightedZ =
      z(log.soc, 'soc') * 0.15 +
      z(log.temperature, 'temperature') * 0.30 +
      z(log.gridLoad, 'gridLoad') * 0.20 +
      z(log.chargingRate, 'chargingRate') * 0.35;

    const edgeScore = Math.round(Math.min(100, (weightedZ / 4) * 100));
    const ruleScore = log.riskScore ?? 0;
    const hybridScore = Math.round(Math.min(100, ruleScore * 0.55 + edgeScore * 0.45));

    const reasons = [...(log.anomalyReasons ?? [])];
    if (edgeScore >= 70) reasons.push('Edge-AI detected an unusual combination of charging conditions');
    else if (edgeScore >= 50) reasons.push('Edge-AI detected a moderate deviation from the local charging baseline');

    return {
      ...log,
      edgeAnomalyScore: edgeScore,
      riskScore: hybridScore,
      isAnomaly: log.isAnomaly || edgeScore >= 70,
      anomalyReasons: Array.from(new Set(reasons)),
    };
  });
}

export function getEdgeAIMetrics(logs: ChargingLog[]): EdgeAIMetrics {
  if (!logs.length) {
    return { model: 'Local Hybrid Edge-AI', analyzed: 0, edgeAnomalies: 0, averageScore: 0, localInference: true };
  }
  const scores = logs.map(l => l.edgeAnomalyScore ?? 0);
  return {
    model: 'Local Hybrid Edge-AI',
    analyzed: logs.length,
    edgeAnomalies: scores.filter(s => s >= 70).length,
    averageScore: Math.round(mean(scores) * 10) / 10,
    localInference: true,
  };
}
