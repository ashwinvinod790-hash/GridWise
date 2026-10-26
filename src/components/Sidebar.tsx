import { LayoutDashboard, Table2, Brain, Shield, Upload, FileText, Zap, BrainCircuit, Gauge } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'logs', label: 'Log Viewer', icon: Table2 },
  { id: 'audit', label: 'AI Audit', icon: Brain },
  { id: 'edgeai', label: 'Edge-AI', icon: BrainCircuit },
  { id: 'optimize', label: 'Load Optimization', icon: Gauge },
  { id: 'explain', label: 'Explainability', icon: FileText },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'upload', label: 'Upload', icon: Upload },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">EV Charging</h1>
            <p className="text-xs text-muted-foreground font-mono">AUDIT AI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary glow-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center font-mono">v1.0.0 • AI-Powered</p>
      </div>
    </aside>
  );
}
