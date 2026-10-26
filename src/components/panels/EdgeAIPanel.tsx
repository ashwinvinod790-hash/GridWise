import { useData } from '@/context/DataContext';
import { BrainCircuit, Cpu, ShieldCheck, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function EdgeAIPanel() {
  const { logs, edgeAIMetrics } = useData();

  if (!edgeAIMetrics || !logs.length) {
    return <div className="flex items-center justify-center h-96 text-muted-foreground"><p className="text-lg">Upload a CSV file to run local Edge-AI analysis</p></div>;
  }

  const highest = [...logs].sort((a, b) => (b.edgeAnomalyScore ?? 0) - (a.edgeAnomalyScore ?? 0)).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-primary" />Edge-AI Anomaly Detection</h2>
        <p className="text-sm text-muted-foreground mt-1">Lightweight local inference using the uploaded charging data — no cloud AI API required</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5"><Cpu className="w-4 h-4 text-primary mb-3" /><p className="text-xs text-muted-foreground">Inference</p><p className="font-bold mt-1">Local / Edge</p></div>
        <div className="glass-card rounded-xl p-5"><Activity className="w-4 h-4 text-primary mb-3" /><p className="text-xs text-muted-foreground">Records Analyzed</p><p className="text-2xl font-bold mt-1">{edgeAIMetrics.analyzed}</p></div>
        <div className="glass-card rounded-xl p-5"><ShieldCheck className="w-4 h-4 text-destructive mb-3" /><p className="text-xs text-muted-foreground">Edge Anomalies</p><p className="text-2xl font-bold mt-1">{edgeAIMetrics.edgeAnomalies}</p></div>
        <div className="glass-card rounded-xl p-5"><BrainCircuit className="w-4 h-4 text-primary mb-3" /><p className="text-xs text-muted-foreground">Average Score</p><p className="text-2xl font-bold mt-1">{edgeAIMetrics.averageScore}/100</p></div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold">Local Model</h3><span className="text-xs text-success bg-success/10 px-2 py-1 rounded">RUNNING LOCALLY</span></div>
        <p className="text-sm text-muted-foreground">{edgeAIMetrics.model} builds a baseline from SoC, temperature, grid load and charging rate. It combines the local deviation score with the existing safety rules to produce the dashboard risk score.</p>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Highest Edge-AI Scores</h3>
        <div className="space-y-4">
          {highest.map(log => {
            const score = log.edgeAnomalyScore ?? 0;
            return <div key={log.id}>
              <div className="flex justify-between text-xs mb-1"><span>Log #{log.id} • {log.chargingRate} kW • {log.temperature}°C</span><span className={score >= 70 ? 'text-destructive' : 'text-muted-foreground'}>{score}/100</span></div>
              <Progress value={score} />
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
