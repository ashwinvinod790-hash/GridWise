import { ChargingLog, AuditSummary, FeatureImportance } from './types';

export function analyzeLog(log: ChargingLog): ChargingLog {
  const reasons: string[] = [];
  let riskScore = 0;

  // High charging rate at high temperature
  if (log.chargingRate > 80 && log.temperature > 40) {
    reasons.push('High charging rate at elevated temperature — risk of battery degradation');
    riskScore += 35;
  }

  // Very low SoC with low charging rate
  if (log.soc < 15 && log.chargingRate < 20) {
    reasons.push('Low SoC with unusually low charging rate — possible throttling issue');
    riskScore += 20;
  }

  // High grid load with high charging rate
  if (log.gridLoad > 85 && log.chargingRate > 70) {
    reasons.push('Charging at full power during peak grid load — grid stress detected');
    riskScore += 25;
  }

  // Temperature extremes
  if (log.temperature > 50) {
    reasons.push('Extreme temperature detected — safety concern');
    riskScore += 40;
  }
  if (log.temperature < -10) {
    reasons.push('Sub-zero temperature — charging efficiency severely impacted');
    riskScore += 15;
  }

  // Inconsistent decision: high SoC but high charging rate
  if (log.soc > 90 && log.chargingRate > 60) {
    reasons.push('High SoC with aggressive charging — inconsistent decision, battery stress risk');
    riskScore += 30;
  }

  // Charging rate exceeds safe bounds
  if (log.chargingRate > 120) {
    reasons.push('Charging rate exceeds safe operational limits');
    riskScore += 50;
  }

  return {
    ...log,
    isAnomaly: reasons.length > 0,
    anomalyReasons: reasons,
    riskScore: Math.min(riskScore, 100),
  };
}

export function analyzeLogs(logs: ChargingLog[]): ChargingLog[] {
  return logs.map(analyzeLog);
}

export function generateSummary(logs: ChargingLog[]): AuditSummary {
  const anomalies = logs.filter(l => l.isAnomaly);
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const anomalyRatio = logs.length ? anomalies.length / logs.length : 0;
  let riskLevel: AuditSummary['riskLevel'] = 'low';
  if (anomalyRatio > 0.3) riskLevel = 'critical';
  else if (anomalyRatio > 0.2) riskLevel = 'high';
  else if (anomalyRatio > 0.1) riskLevel = 'medium';

  const tamperingAlerts: string[] = [];
  const highRiskLogs = logs.filter(l => (l.riskScore ?? 0) > 60);
  if (highRiskLogs.length > 3) {
    tamperingAlerts.push(`${highRiskLogs.length} logs with risk score >60 — potential systematic issue`);
  }

  const extremeRates = logs.filter(l => l.chargingRate > 120);
  if (extremeRates.length > 0) {
    tamperingAlerts.push(`${extremeRates.length} entries with charging rates exceeding safe limits — possible data tampering`);
  }

  const sameExplanation = logs.filter(l => l.explanation === logs[0]?.explanation);
  if (logs.length > 5 && sameExplanation.length === logs.length) {
    tamperingAlerts.push('All log entries have identical explanations — suspicious pattern');
  }

  return {
    totalLogs: logs.length,
    anomalyCount: anomalies.length,
    avgChargingRate: Math.round(avg(logs.map(l => l.chargingRate)) * 10) / 10,
    avgSoC: Math.round(avg(logs.map(l => l.soc)) * 10) / 10,
    avgTemperature: Math.round(avg(logs.map(l => l.temperature)) * 10) / 10,
    avgGridLoad: Math.round(avg(logs.map(l => l.gridLoad)) * 10) / 10,
    riskLevel,
    tamperingAlerts,
  };
}

export function getFeatureImportance(logs: ChargingLog[]): FeatureImportance[] {
  if (!logs.length) return [];
  const anomalies = logs.filter(l => l.isAnomaly);
  if (!anomalies.length) {
    return [
      { feature: 'SoC', importance: 0.25 },
      { feature: 'Temperature', importance: 0.25 },
      { feature: 'Grid Load', importance: 0.25 },
      { feature: 'Charging Rate', importance: 0.25 },
    ];
  }

  // Simple correlation-based importance
  const corrWithAnomaly = (getter: (l: ChargingLog) => number) => {
    const vals = logs.map(getter);
    const labels = logs.map(l => l.isAnomaly ? 1 : 0);
    const meanV = vals.reduce((a, b) => a + b, 0) / vals.length;
    const meanL = labels.reduce((a, b) => a + b, 0) / labels.length;
    let num = 0, denV = 0, denL = 0;
    for (let i = 0; i < vals.length; i++) {
      const dv = vals[i] - meanV;
      const dl = labels[i] - meanL;
      num += dv * dl;
      denV += dv * dv;
      denL += dl * dl;
    }
    const den = Math.sqrt(denV * denL);
    return den === 0 ? 0 : Math.abs(num / den);
  };

  const raw = [
    { feature: 'SoC', importance: corrWithAnomaly(l => l.soc) },
    { feature: 'Temperature', importance: corrWithAnomaly(l => l.temperature) },
    { feature: 'Grid Load', importance: corrWithAnomaly(l => l.gridLoad) },
    { feature: 'Charging Rate', importance: corrWithAnomaly(l => l.chargingRate) },
  ];

  const total = raw.reduce((a, b) => a + b.importance, 0) || 1;
  return raw.map(r => ({ ...r, importance: Math.round((r.importance / total) * 100) / 100 }));
}
