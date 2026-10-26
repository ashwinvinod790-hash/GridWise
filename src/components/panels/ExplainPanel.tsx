import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, BatteryCharging, CheckCircle2, FileText, Gauge, Thermometer } from 'lucide-react';

const COLORS = ['hsl(174 72% 46%)', 'hsl(38 92% 50%)', 'hsl(262 60% 58%)', 'hsl(0 72% 55%)'];

function getDecisionDetails(log: {
  soc: number;
  temperature: number;
  gridLoad: number;
  chargingRate: number;
  isAnomaly?: boolean;
  riskScore?: number;
  edgeAnomalyScore?: number;
  anomalyReasons?: string[];
}) {
  const details: string[] = [];

  if (log.temperature > 50) details.push('Critical temperature: above 50°C, requiring immediate safety review.');
  else if (log.temperature > 40) details.push('Elevated temperature: thermal conditions may increase battery stress.');
  else if (log.temperature < 0) details.push('Low ambient/battery temperature may reduce charging efficiency.');

  if (log.gridLoad > 85) details.push('Grid load is above 85%, so additional charging demand may increase grid stress.');
  else if (log.gridLoad >= 75) details.push('Grid load is approaching a high-load range; monitor available capacity.');

  if (log.chargingRate > 120) details.push('Charging rate exceeds the configured 120 kW safety threshold.');
  else if (log.chargingRate > 80) details.push('Charging rate is high and should be assessed alongside temperature and grid load.');
  else if (log.chargingRate < 20) details.push('Charging rate is low; check whether the rate is appropriate for the current SoC and charging session.');

  if (log.soc >= 90) details.push('Battery SoC is at least 90%; aggressive charging may provide limited benefit and add battery stress.');
  else if (log.soc < 15) details.push('Battery SoC is below 15%; confirm that the charging rate is adequate for the charging requirement.');

  if ((log.edgeAnomalyScore ?? 0) >= 70) {
    details.push('Local Edge-AI score indicates a strong deviation from the uploaded dataset baseline.');
  } else if ((log.edgeAnomalyScore ?? 0) >= 50) {
    details.push('Local Edge-AI score indicates a moderate deviation from the uploaded dataset baseline.');
  }

  if (!details.length) {
    details.push('No configured safety rule or strong local-baseline deviation was triggered for this record.');
    details.push('The record is classified as normal based on the available charging parameters; continue routine monitoring.');
  }

  return details;
}

export default function ExplainPanel() {
  const { logs, featureImportance } = useData();
  const [viewMode, setViewMode] = useState<'all' | 'anomaly'>('all');

  if (!logs.length) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p className="text-lg">Upload a CSV file to view explanations</p>
      </div>
    );
  }

  const anomalyCount = logs.filter(log => log.isAnomaly).length;
  const normalCount = logs.length - anomalyCount;
  const displayedLogs = viewMode === 'anomaly' ? logs.filter(log => log.isAnomaly) : logs;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Explainability Panel
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Understand why each charging record was classified and which conditions influenced the decision.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Records explained</p>
          <p className="text-2xl font-bold text-foreground mt-1">{logs.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Anomalous decisions</p>
          <p className="text-2xl font-bold text-destructive mt-1">{anomalyCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Normal decisions</p>
          <p className="text-2xl font-bold text-success mt-1">{normalCount}</p>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="glass-card rounded-xl p-5 animate-fade-in">
        <h3 className="text-sm font-semibold text-foreground mb-1">Feature Importance</h3>
        <p className="text-xs text-muted-foreground mb-4">Relative correlation of each charging parameter with the detected anomaly labels in the uploaded dataset.</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={featureImportance} layout="vertical">
            <XAxis type="number" domain={[0, 1]} tick={{ fill: 'hsl(215 12% 52%)', fontSize: 11 }} />
            <YAxis type="category" dataKey="feature" tick={{ fill: 'hsl(210 20% 92%)', fontSize: 12 }} width={100} />
            <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
              {featureImportance.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filter decision explanations between all records and anomalies only */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Decision Explanations</h3>
            <p className="text-xs text-muted-foreground mt-1">{viewMode === 'all' ? `Showing all ${logs.length} uploaded records.` : `Showing ${displayedLogs.length} anomalous records only.`}</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 self-start" role="group" aria-label="Filter decision explanations">
            <button type="button" onClick={() => setViewMode('all')} aria-pressed={viewMode === 'all'} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All ({logs.length})</button>
            <button type="button" onClick={() => setViewMode('anomaly')} aria-pressed={viewMode === 'anomaly'} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'anomaly' ? 'bg-destructive text-destructive-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Anomalies ({anomalyCount})</button>
          </div>
        </div>
        {displayedLogs.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No anomalies found</p>
            <p className="text-xs text-muted-foreground mt-1">All uploaded records are currently classified as normal.</p>
            <button type="button" onClick={() => setViewMode('all')} className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Show all records</button>
          </div>
        ) : displayedLogs.map(log => {
          const details = getDecisionDetails(log);
          const isAnomaly = Boolean(log.isAnomaly);
          return (
            <div key={log.id} className="glass-card rounded-xl p-4 animate-fade-in">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="font-mono text-xs text-muted-foreground">Log #{log.id}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  isAnomaly ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'
                }`}>
                  {isAnomaly ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {isAnomaly ? 'Anomaly detected' : 'Normal decision'}
                </span>
                <span className="text-xs text-muted-foreground">Risk score: {Math.round(log.riskScore ?? 0)}/100</span>
                {log.edgeAnomalyScore !== undefined && (
                  <span className="text-xs text-muted-foreground">Edge-AI score: {Math.round(log.edgeAnomalyScore)}/100</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                <div className="rounded-lg bg-muted/40 p-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><BatteryCharging className="w-3 h-3" /> SoC</div>
                  <p className="text-sm font-semibold text-foreground mt-1">{log.soc}%</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Thermometer className="w-3 h-3" /> Temperature</div>
                  <p className="text-sm font-semibold text-foreground mt-1">{log.temperature}°C</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Gauge className="w-3 h-3" /> Grid load</div>
                  <p className="text-sm font-semibold text-foreground mt-1">{log.gridLoad}%</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><BatteryCharging className="w-3 h-3" /> Charge rate</div>
                  <p className="text-sm font-semibold text-foreground mt-1">{log.chargingRate} kW</p>
                </div>
              </div>

              {log.explanation && log.explanation !== 'N/A' && (
                <p className="text-sm text-foreground mb-3">Input note: {log.explanation}</p>
              )}

              <div className="border-t border-border/50 pt-3">
                <p className="text-xs font-semibold text-foreground mb-2">Decision reasoning</p>
                <ul className="space-y-1.5">
                  {details.map((detail, i) => <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-primary">•</span><span>{detail}</span></li>)}
                </ul>
              </div>

              {log.anomalyReasons && log.anomalyReasons.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-semibold text-warning mb-1">Triggered detection reasons</p>
                  {log.anomalyReasons.map((reason, i) => (
                    <p key={i} className="text-xs text-warning mt-1">• {reason}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
