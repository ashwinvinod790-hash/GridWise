import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, CheckCircle } from 'lucide-react';

export default function LogViewerPanel() {
  const { logs } = useData();
  const [socFilter, setSocFilter] = useState('');
  const [tempFilter, setTempFilter] = useState('');
  const [rateFilter, setRateFilter] = useState('');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (socFilter && log.soc < parseFloat(socFilter)) return false;
      if (tempFilter && log.temperature < parseFloat(tempFilter)) return false;
      if (rateFilter && log.chargingRate < parseFloat(rateFilter)) return false;
      if (showAnomaliesOnly && !log.isAnomaly) return false;
      return true;
    });
  }, [logs, socFilter, tempFilter, rateFilter, showAnomaliesOnly]);

  if (!logs.length) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p className="text-lg">Upload a CSV file to view logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Log Viewer</h2>
        <p className="text-sm text-muted-foreground mt-1">Browse and filter charging log entries</p>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Filters:</span>
          </div>
          <Input placeholder="Min SoC %" value={socFilter} onChange={e => setSocFilter(e.target.value)} className="w-28 h-8 text-xs bg-secondary border-border" />
          <Input placeholder="Min Temp °C" value={tempFilter} onChange={e => setTempFilter(e.target.value)} className="w-28 h-8 text-xs bg-secondary border-border" />
          <Input placeholder="Min Rate kW" value={rateFilter} onChange={e => setRateFilter(e.target.value)} className="w-28 h-8 text-xs bg-secondary border-border" />
          <button
            onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showAnomaliesOnly ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            Anomalies Only
          </button>
          <span className="text-xs text-muted-foreground ml-auto font-mono">{filtered.length} results</span>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">SoC %</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Temp °C</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grid %</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rate kW</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr
                  key={log.id}
                  className={`border-b border-border/50 transition-colors hover:bg-secondary/30 ${
                    log.isAnomaly ? 'bg-destructive/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    {log.isAnomaly ? (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{log.id}</td>
                  <td className="px-4 py-3 font-mono">{log.soc}</td>
                  <td className="px-4 py-3 font-mono">{log.temperature}</td>
                  <td className="px-4 py-3 font-mono">{log.gridLoad}</td>
                  <td className="px-4 py-3 font-mono">{log.chargingRate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${
                      (log.riskScore ?? 0) > 50 ? 'bg-destructive/20 text-destructive' :
                      (log.riskScore ?? 0) > 0 ? 'bg-warning/20 text-warning' :
                      'bg-success/20 text-success'
                    }`}>
                      {log.riskScore ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{log.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
