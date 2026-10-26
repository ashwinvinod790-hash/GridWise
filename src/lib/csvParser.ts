import { ChargingLog } from './types';

export function parseCSV(text: string): ChargingLog[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
  
  const findCol = (names: string[]) => {
    return headers.findIndex(h => names.some(n => h.includes(n)));
  };

  const socIdx = findCol(['soc', 'stateofcharge']);
  const tempIdx = findCol(['temp', 'temperature']);
  const gridIdx = findCol(['grid', 'gridload']);
  const rateIdx = findCol(['rate', 'chargingrate', 'charging']);
  const explIdx = findCol(['explanation', 'reason', 'note']);

  return lines.slice(1).map((line, i) => {
    const cols = line.split(',').map(c => c.trim());
    return {
      id: i + 1,
      soc: parseFloat(cols[socIdx] ?? '0') || 0,
      temperature: parseFloat(cols[tempIdx] ?? '0') || 0,
      gridLoad: parseFloat(cols[gridIdx] ?? '0') || 0,
      chargingRate: parseFloat(cols[rateIdx] ?? '0') || 0,
      explanation: cols[explIdx] ?? 'N/A',
    };
  }).filter(log => !isNaN(log.soc));
}

export function generateSampleCSV(): string {
  const header = 'SoC,Temperature,Grid Load,Charging Rate,Explanation';
  const rows = [
    '45,28,60,55,Normal charging at moderate conditions',
    '80,35,70,65,Optimal fast charging session',
    '15,42,90,95,Emergency rapid charge in hot weather',
    '92,30,40,75,High SoC aggressive charging detected',
    '30,25,55,40,Standard slow charge overnight',
    '10,48,85,110,Critical low battery extreme heat charge',
    '65,22,30,50,Regular midday charging session',
    '88,38,75,80,Near-full battery fast charge attempt',
    '20,-5,45,25,Cold weather reduced rate charging',
    '55,32,65,60,Balanced grid-aware charging',
    '5,52,95,130,Emergency override maximum rate',
    '70,28,50,55,Normal afternoon charging cycle',
    '40,35,80,70,Peak hours moderate charging',
    '95,25,35,85,Almost full aggressive charge',
    '35,30,60,45,Standard residential charging',
  ];
  return [header, ...rows].join('\n');
}
