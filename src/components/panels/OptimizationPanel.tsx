import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { Gauge, ShieldCheck, TrendingDown, Zap, Download, Search, SlidersHorizontal, Thermometer, BatteryCharging, Network, RotateCcw, GitCompare, CheckCircle2 } from 'lucide-react';
import { optimizeCharging } from '@/lib/optimizer';
import type { OptimizationRecommendation } from '@/lib/types';

type ViewFilter = 'all' | 'reduced' | 'thermal' | 'grid' | 'soc';
type SortMode = 'largest' | 'log' | 'rate';

export default function OptimizationPanel() {
  const { logs, optimization: baseOptimization } = useData();
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('largest');
  const [search, setSearch] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notice, setNotice] = useState('');

  // Recalculate locally from the currently loaded records; no charger is controlled.
  const optimization = useMemo(() => logs.length ? optimizeCharging(logs) : baseOptimization, [logs, baseOptimization]);

  const recommendations = useMemo(() => {
    if (!optimization) return [] as OptimizationRecommendation[];
    const query = search.trim().toLowerCase();
    const rows = optimization.recommendations.filter(r => {
      const log = logs.find(l => l.id === r.logId);
      if (query && !String(r.logId).toLowerCase().includes(query)) return false;
      if (viewFilter === 'reduced' && r.reduction <= 0) return false;
      if (viewFilter === 'thermal' && !(log && log.temperature >= 40)) return false;
      if (viewFilter === 'grid' && !(log && log.gridLoad >= 80)) return false;
      if (viewFilter === 'soc' && !(log && log.soc >= 80)) return false;
      return true;
    });
    rows.sort((a, b) => sortMode === 'log' ? a.logId - b.logId : sortMode === 'rate' ? b.currentRate - a.currentRate : b.reduction - a.reduction);
    return rows;
  }, [optimization, logs, search, viewFilter, sortMode]);

  if (!optimization || !logs.length) {
    return <div className="flex items-center justify-center h-96 text-muted-foreground"><p className="text-lg">Upload a CSV file to calculate smart load optimization</p></div>;
  }

  const overloaded = optimization.currentLoad > optimization.gridCapacity;
  const totalReduction = optimization.recommendations.reduce((sum, r) => sum + r.reduction, 0);
  const reducedCount = optimization.recommendations.filter(r => r.reduction > 0).length;
  const visibleRecommendations = showAll ? recommendations : recommendations.slice(0, 8);

  const exportCSV = () => {
    const header = 'Log ID,Current Rate (kW),Recommended Rate (kW),Reduction (kW),Reason';
    const rows = recommendations.map(r => [r.logId, r.currentRate, r.recommendedRate, r.reduction, `"${r.reason.replace(/"/g, '""')}"`].join(','));
    const blob = new Blob([[header, ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gridwise-optimization-recommendations.csv';
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`Exported ${recommendations.length} recommendation rows.`);
  };

  const resetView = () => {
    setViewFilter('all'); setSortMode('largest'); setSearch(''); setCompareMode(false); setShowAll(false);
    setNotice('View reset to all recommendations, sorted by largest reduction.');
  };

  const filters: { key: ViewFilter; label: string; icon: typeof SlidersHorizontal }[] = [
    { key: 'all', label: 'All', icon: SlidersHorizontal },
    { key: 'reduced', label: 'Rate reductions', icon: TrendingDown },
    { key: 'thermal', label: 'Thermal safety', icon: Thermometer },
    { key: 'grid', label: 'Grid stress', icon: Network },
    { key: 'soc', label: 'High SoC', icon: BatteryCharging },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Gauge className="w-5 h-5 text-primary" />Smart Load Optimization</h2>
        <p className="text-sm text-muted-foreground mt-1">Local charging-rate recommendations designed to reduce peak grid stress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5"><p className="text-xs text-muted-foreground">Grid Capacity</p><p className="text-2xl font-bold mt-1">{optimization.gridCapacity} kW</p></div>
        <div className="glass-card rounded-xl p-5"><p className="text-xs text-muted-foreground">Current Load</p><p className={`text-2xl font-bold mt-1 ${overloaded ? 'text-destructive' : 'text-foreground'}`}>{optimization.currentLoad}%</p></div>
        <div className="glass-card rounded-xl p-5"><p className="text-xs text-muted-foreground">Optimized Load</p><p className="text-2xl font-bold mt-1 text-primary">{optimization.optimizedLoad}%</p></div>
        <div className="glass-card rounded-xl p-5"><p className="text-xs text-muted-foreground">Load Reduction</p><p className="text-2xl font-bold mt-1 text-success">{optimization.reductionPercent}%</p></div>
      </div>

      <div className={`glass-card rounded-xl p-5 border-l-4 ${overloaded ? 'border-l-destructive' : 'border-l-success'}`}>
        <div className="flex items-center gap-3">
          {overloaded ? <Zap className="w-5 h-5 text-destructive" /> : <ShieldCheck className="w-5 h-5 text-success" />}
          <div><h3 className="font-semibold">{overloaded ? 'Grid stress detected' : 'Grid operating within target'}</h3><p className="text-sm text-muted-foreground mt-1">Recommendations focus on thermal safety, high SoC and peak-load prevention.</p></div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-semibold">Optimization Controls</h3><p className="text-xs text-muted-foreground mt-1">Filter, prioritize, compare, or export the recommendations below.</p></div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCompareMode(v => !v)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${compareMode ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/70'}`}><GitCompare className="w-4 h-4" />{compareMode ? 'Hide comparison' : 'Compare before / after'}</button>
            <button onClick={exportCSV} className="px-3 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/70 transition-colors flex items-center gap-2"><Download className="w-4 h-4" />Export CSV</button>
            <button onClick={resetView} className="px-3 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/70 transition-colors flex items-center gap-2"><RotateCcw className="w-4 h-4" />Reset</button>
          </div>
        </div>
        <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a log by ID…" className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:ring-2 focus:ring-primary/40" /></div>
        <div className="flex flex-wrap gap-2">
          {filters.map(({ key, label, icon: Icon }) => <button key={key} onClick={() => setViewFilter(key)} aria-pressed={viewFilter === key} className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${viewFilter === key ? 'bg-primary/15 text-primary border border-primary/40' : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'}`}><Icon className="w-3.5 h-3.5" />{label}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <label htmlFor="optimization-sort">Sort by</label>
          <select id="optimization-sort" value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground">
            <option value="largest">Largest reduction first</option><option value="log">Log ID</option><option value="rate">Highest current rate</option>
          </select>
          <span className="ml-auto font-mono">{recommendations.length} matching / {optimization.recommendations.length} total</span>
        </div>
        {compareMode && <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div><p className="text-xs text-muted-foreground">Records with reduced rate</p><p className="text-xl font-bold">{reducedCount}</p></div>
          <div><p className="text-xs text-muted-foreground">Combined recommended reduction</p><p className="text-xl font-bold text-primary">{Math.round(totalReduction * 10) / 10} kW</p></div>
          <div><p className="text-xs text-muted-foreground">Average load change</p><p className="text-xl font-bold text-success">{optimization.reductionPercent}%</p></div>
          <p className="sm:col-span-3 text-xs text-muted-foreground">Comparison is a software recommendation based on the uploaded logs; it does not apply changes to physical chargers.</p>
        </div>}
        {notice && <div role="status" className="flex items-center gap-2 text-xs text-success"><CheckCircle2 className="w-4 h-4" />{notice}<button onClick={() => setNotice('')} className="ml-auto underline">Dismiss</button></div>}
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4"><h3 className="text-sm font-semibold">Recommended Charging Rates</h3><TrendingDown className="w-4 h-4 text-primary" /></div>
        <div className="space-y-2">
          {visibleRecommendations.length ? visibleRecommendations.map(r => (
            <div key={r.logId} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 items-center bg-secondary rounded-lg p-3 text-xs">
              <span className="font-mono">Log #{r.logId}</span>
              <span>{r.currentRate} → <strong className="text-primary">{r.recommendedRate} kW</strong></span>
              <span className={r.reduction > 0 ? 'text-success' : 'text-muted-foreground'}>{r.reduction > 0 ? `-${r.reduction} kW` : 'No reduction'}</span>
              <span className="text-muted-foreground">{r.reason}</span>
            </div>
          )) : <p className="text-sm text-muted-foreground py-4">No recommendations match these controls. Try another filter or reset the view.</p>}
        </div>
        {recommendations.length > 8 && <button onClick={() => setShowAll(v => !v)} className="mt-4 w-full px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/70 text-xs font-medium transition-colors">{showAll ? 'Show fewer recommendations' : `Show all ${recommendations.length} matching recommendations`}</button>}
      </div>

      <div className="glass-card rounded-xl p-5"><h3 className="text-sm font-semibold mb-3">How it works</h3><p className="text-sm text-muted-foreground">GridWise locally adjusts recommended charging rates when grid load, battery temperature, or SoC indicates that full-rate charging could create unnecessary stress. Use the filters to prioritize thermal safety, grid stress, or high-SoC records, and export the current view for auditing. This is a decision-support simulation and does not control physical chargers.</p></div>
    </div>
  );
}
