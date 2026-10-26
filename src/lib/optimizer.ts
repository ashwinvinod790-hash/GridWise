import { ChargingLog, OptimizationResult } from './types';

export const DEFAULT_GRID_CAPACITY = 100;

/**
 * Simple secure load optimizer. Grid load is represented as a percentage of
 * configured capacity. It recommends a lower charging rate when the station
 * is near capacity, when temperature is high, or when SoC is already high.
 */
export function optimizeCharging(logs: ChargingLog[], gridCapacity = DEFAULT_GRID_CAPACITY): OptimizationResult {
  if (!logs.length) {
    return { gridCapacity, currentLoad: 0, optimizedLoad: 0, reductionPercent: 0, recommendations: [] };
  }

  const currentLoad = Math.round((logs.reduce((sum, l) => sum + l.gridLoad, 0) / logs.length) * 10) / 10;
  const recommendations = logs.map(log => {
    let factor = 1;

    if (log.gridLoad >= 90) factor *= 0.80;
    else if (log.gridLoad >= 80) factor *= 0.90;

    if (log.temperature >= 45) factor *= 0.80;
    else if (log.temperature >= 40) factor *= 0.90;

    if (log.soc >= 90) factor *= 0.85;
    else if (log.soc >= 80) factor *= 0.95;

    const recommendedRate = Math.max(5, Math.round(log.chargingRate * factor * 10) / 10);
    const reduction = Math.max(0, Math.round((log.chargingRate - recommendedRate) * 10) / 10);
    const reason = reduction > 0
      ? log.temperature >= 40
        ? 'Reduced for thermal safety'
        : log.gridLoad >= 80
          ? 'Reduced to relieve grid load'
          : 'Reduced because SoC is already high'
      : 'No reduction required';

    return { logId: log.id, currentRate: log.chargingRate, recommendedRate, reduction, reason };
  });

  const reductionFactor = recommendations.length
    ? recommendations.reduce((sum, r) => sum + r.recommendedRate / Math.max(r.currentRate, 1), 0) / recommendations.length
    : 1;
  const optimizedLoad = Math.round(currentLoad * reductionFactor * 10) / 10;
  const reductionPercent = currentLoad ? Math.round(((currentLoad - optimizedLoad) / currentLoad) * 1000) / 10 : 0;

  return { gridCapacity, currentLoad, optimizedLoad, reductionPercent, recommendations };
}
