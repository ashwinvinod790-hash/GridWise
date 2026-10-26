import { ChargingLog, AuditSummary } from './types';

export function downloadAuditReport(logs: ChargingLog[], summary: AuditSummary) {
  const anomalies = logs.filter(l => l.isAnomaly);
  const now = new Date().toLocaleString();

  let content = `EV CHARGING AUDIT REPORT\n`;
  content += `Generated: ${now}\n`;
  content += `${'='.repeat(60)}\n\n`;

  content += `SUMMARY\n${'-'.repeat(40)}\n`;
  content += `Total Logs Analyzed: ${summary.totalLogs}\n`;
  content += `Anomalies Detected: ${summary.anomalyCount}\n`;
  content += `Risk Level: ${summary.riskLevel.toUpperCase()}\n`;
  content += `Avg Charging Rate: ${summary.avgChargingRate} kW\n`;
  content += `Avg SoC: ${summary.avgSoC}%\n`;
  content += `Avg Temperature: ${summary.avgTemperature}°C\n`;
  content += `Avg Grid Load: ${summary.avgGridLoad}%\n\n`;

  if (summary.tamperingAlerts.length > 0) {
    content += `SECURITY ALERTS\n${'-'.repeat(40)}\n`;
    summary.tamperingAlerts.forEach((a, i) => {
      content += `⚠ ${i + 1}. ${a}\n`;
    });
    content += '\n';
  }

  if (anomalies.length > 0) {
    content += `ANOMALY DETAILS\n${'-'.repeat(40)}\n`;
    anomalies.forEach(log => {
      content += `\nLog #${log.id} | Risk Score: ${log.riskScore}/100\n`;
      content += `  SoC: ${log.soc}% | Temp: ${log.temperature}°C | Grid: ${log.gridLoad}% | Rate: ${log.chargingRate} kW\n`;
      log.anomalyReasons?.forEach(r => {
        content += `  → ${r}\n`;
      });
    });
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ev-audit-report-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
