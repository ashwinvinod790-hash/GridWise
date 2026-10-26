import { useData } from '@/context/DataContext';
import { AlertTriangle, Brain } from 'lucide-react';

export default function AuditPanel() {
  const { logs } = useData();
  const anomalies = logs.filter(l => l.isAnomaly);

  if (!logs.length) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p className="text-lg">Upload a CSV file to run AI audit</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Audit Engine
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Anomaly detection results • {anomalies.length} issues found in {logs.length} logs
        </p>
      </div>

      {anomalies.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-success font-medium">✓ No anomalies detected — all logs appear normal</p>
        </div>
      ) : (
        <div className="space-y-4">
          {anomalies.map(log => (
            <div key={log.id} className="glass-card rounded-xl p-5 border-l-4 border-l-destructive animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="font-semibold text-sm text-foreground">Log #{log.id}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-destructive/20 text-destructive">
                    Risk: {log.riskScore}/100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <p className="text-muted-foreground">SoC</p>
                  <p className="font-mono font-bold text-foreground">{log.soc}%</p>
                </div>
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <p className="text-muted-foreground">Temp</p>
                  <p className="font-mono font-bold text-foreground">{log.temperature}°C</p>
                </div>
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <p className="text-muted-foreground">Grid</p>
                  <p className="font-mono font-bold text-foreground">{log.gridLoad}%</p>
                </div>
                <div className="bg-secondary rounded-lg p-2 text-center">
                  <p className="text-muted-foreground">Rate</p>
                  <p className="font-mono font-bold text-foreground">{log.chargingRate} kW</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {log.anomalyReasons?.map((reason, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">→</span>
                    {reason}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
