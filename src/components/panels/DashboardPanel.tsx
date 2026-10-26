import { Activity, AlertTriangle, Battery, Thermometer, Zap, Gauge } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '@/components/StatCard';
import { useData } from '@/context/DataContext';

export default function DashboardPanel() {
  const { logs, summary } = useData();

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p className="text-lg">Upload a CSV file to view the dashboard</p>
      </div>
    );
  }

  const barData = logs.map(l => ({
    id: l.id,
    rate: l.chargingRate,
    isAnomaly: l.isAnomaly,
  }));

  const lineData = logs.map(l => ({
    id: l.id,
    soc: l.soc,
    temp: l.temperature,
    grid: l.gridLoad,
  }));

  const scatterData = logs.map(l => ({
    x: l.temperature,
    y: l.chargingRate,
    risk: l.riskScore ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Real-time analysis of EV charging logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Logs" value={summary.totalLogs} icon={Activity} variant="primary" />
        <StatCard title="Anomalies" value={summary.anomalyCount} subtitle={`${Math.round((summary.anomalyCount / summary.totalLogs) * 100)}% of total`} icon={AlertTriangle} variant="destructive" />
        <StatCard title="Avg Charge Rate" value={`${summary.avgChargingRate} kW`} icon={Zap} variant="success" />
        <StatCard title="Risk Level" value={summary.riskLevel.toUpperCase()} icon={Gauge} variant={summary.riskLevel === 'low' ? 'success' : summary.riskLevel === 'medium' ? 'warning' : 'destructive'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Avg SoC" value={`${summary.avgSoC}%`} icon={Battery} />
        <StatCard title="Avg Temperature" value={`${summary.avgTemperature}°C`} icon={Thermometer} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Charging Rate by Log</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
              <XAxis dataKey="id" tick={{ fill: 'hsl(215 12% 52%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(215 12% 52%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(220 18% 12%)', border: '1px solid hsl(220 14% 18%)', borderRadius: 8, color: 'hsl(210 20% 92%)' }} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.isAnomaly ? 'hsl(0 72% 55%)' : 'hsl(174 72% 46%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">SoC, Temperature & Grid Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
              <XAxis dataKey="id" tick={{ fill: 'hsl(215 12% 52%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(215 12% 52%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(220 18% 12%)', border: '1px solid hsl(220 14% 18%)', borderRadius: 8, color: 'hsl(210 20% 92%)' }} />
              <Line type="monotone" dataKey="soc" stroke="hsl(174 72% 46%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="temp" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="grid" stroke="hsl(262 60% 58%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter Plot */}
        <div className="glass-card rounded-xl p-5 animate-fade-in lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Temperature vs Charging Rate (Risk)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
              <XAxis type="number" dataKey="x" name="Temperature" unit="°C" tick={{ fill: 'hsl(215 12% 52%)', fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Charging Rate" unit="kW" tick={{ fill: 'hsl(215 12% 52%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(220 18% 12%)', border: '1px solid hsl(220 14% 18%)', borderRadius: 8, color: 'hsl(210 20% 92%)' }} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} fill="hsl(174 72% 46%)">
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={entry.risk > 30 ? 'hsl(0 72% 55%)' : entry.risk > 0 ? 'hsl(38 92% 50%)' : 'hsl(174 72% 46%)'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
