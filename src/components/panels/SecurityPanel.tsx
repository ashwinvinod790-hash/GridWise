import { useData } from '@/context/DataContext';
import { Shield, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function SecurityPanel() {
  const { logs, summary } = useData();

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p className="text-lg">Upload a CSV file to run security analysis</p>
      </div>
    );
  }

  const highRisk = logs.filter(l => (l.riskScore ?? 0) > 60);
  const hasAlerts = summary.tamperingAlerts.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Security Insights
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Tampering detection and behavioral analysis</p>
      </div>

      {/* Risk overview */}
      <div className={`glass-card rounded-xl p-6 border-l-4 animate-fade-in ${
        hasAlerts ? 'border-l-destructive' : 'border-l-success'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          {hasAlerts ? (
            <AlertOctagon className="w-6 h-6 text-destructive" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-success" />
          )}
          <h3 className="text-lg font-bold text-foreground">
            {hasAlerts ? 'Security Alerts Detected' : 'No Security Issues Found'}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {hasAlerts
            ? `${summary.tamperingAlerts.length} potential issues require investigation`
            : 'All charging logs passed security checks'}
        </p>
      </div>

      {/* Alerts list */}
      {hasAlerts && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Tampering Alerts</h3>
          {summary.tamperingAlerts.map((alert, i) => (
            <div key={i} className="glass-card rounded-xl p-4 border-l-4 border-l-warning animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-4 h-4 text-warning mt-0.5" />
                <p className="text-sm text-foreground">{alert}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* High-risk entries */}
      {highRisk.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">High-Risk Entries (Score &gt; 60)</h3>
          {highRisk.map(log => (
            <div key={log.id} className="glass-card rounded-xl p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-foreground">Log #{log.id}</span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-destructive/20 text-destructive">
                  Risk: {log.riskScore}/100
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-center mb-2">
                <div className="bg-secondary rounded p-1.5">
                  <p className="text-muted-foreground">SoC</p>
                  <p className="font-mono font-bold">{log.soc}%</p>
                </div>
                <div className="bg-secondary rounded p-1.5">
                  <p className="text-muted-foreground">Temp</p>
                  <p className="font-mono font-bold">{log.temperature}°C</p>
                </div>
                <div className="bg-secondary rounded p-1.5">
                  <p className="text-muted-foreground">Grid</p>
                  <p className="font-mono font-bold">{log.gridLoad}%</p>
                </div>
                <div className="bg-secondary rounded p-1.5">
                  <p className="text-muted-foreground">Rate</p>
                  <p className="font-mono font-bold">{log.chargingRate} kW</p>
                </div>
              </div>
              {log.anomalyReasons?.map((r, i) => (
                <p key={i} className="text-xs text-destructive">→ {r}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
