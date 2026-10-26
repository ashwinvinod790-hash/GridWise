import { useState } from 'react';
import { DataProvider } from '@/context/DataContext';
import Sidebar from '@/components/Sidebar';
import DashboardPanel from '@/components/panels/DashboardPanel';
import LogViewerPanel from '@/components/panels/LogViewerPanel';
import AuditPanel from '@/components/panels/AuditPanel';
import ExplainPanel from '@/components/panels/ExplainPanel';
import SecurityPanel from '@/components/panels/SecurityPanel';
import UploadPanel from '@/components/panels/UploadPanel';
import EdgeAIPanel from '@/components/panels/EdgeAIPanel';
import OptimizationPanel from '@/components/panels/OptimizationPanel';

const panels: Record<string, React.ComponentType<{ onNavigate?: (tab: string) => void }>> = {
  dashboard: DashboardPanel,
  logs: LogViewerPanel,
  audit: AuditPanel,
  edgeai: EdgeAIPanel,
  optimize: OptimizationPanel,
  explain: ExplainPanel,
  security: SecurityPanel,
};

export default function Index() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <DataProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 ml-64 p-8 max-w-6xl">
          {activeTab === 'upload' ? (
            <UploadPanel onNavigate={setActiveTab} />
          ) : (
            (() => {
              const Panel = panels[activeTab];
              return Panel ? <Panel /> : null;
            })()
          )}
        </main>
      </div>
    </DataProvider>
  );
}
