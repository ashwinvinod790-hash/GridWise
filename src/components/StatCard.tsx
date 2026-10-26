import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'warning' | 'destructive' | 'success';
}

const variantStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  warning: 'text-warning',
  destructive: 'text-destructive',
  success: 'text-success',
};

const iconBg = {
  default: 'bg-secondary',
  primary: 'bg-primary/10',
  warning: 'bg-warning/10',
  destructive: 'bg-destructive/10',
  success: 'bg-success/10',
};

export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'default' }: StatCardProps) {
  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-bold mt-1 font-mono ${variantStyles[variant]}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg[variant]}`}>
          <Icon className={`w-5 h-5 ${variantStyles[variant]}`} />
        </div>
      </div>
    </div>
  );
}
