import { useCallback, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { Upload, FileUp, Trash2, Download, Database } from 'lucide-react';
import { generateSampleCSV } from '@/lib/csvParser';
import { downloadAuditReport } from '@/lib/pdfExport';
import { Button } from '@/components/ui/button';

interface UploadPanelProps {
  onNavigate: (tab: string) => void;
}

export default function UploadPanel({ onNavigate }: UploadPanelProps) {
  const { logs, summary, isLoaded, loadCSV, clearData } = useData();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      loadCSV(text);
      onNavigate('dashboard');
    };
    reader.readAsText(file);
  }, [loadCSV, onNavigate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
  }, [handleFile]);

  const loadSample = () => {
    loadCSV(generateSampleCSV());
    onNavigate('dashboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Upload & Manage</h2>
        <p className="text-sm text-muted-foreground mt-1">Import CSV charging logs for analysis</p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="glass-card rounded-xl p-12 border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-all duration-300 text-center group"
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <FileUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
        <p className="text-foreground font-medium">Drop CSV file here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-2">Expected columns: SoC, Temperature, Grid Load, Charging Rate, Explanation</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={loadSample}
          variant="outline"
          className="gap-2"
        >
          <Database className="w-4 h-4" />
          Load Sample Data
        </Button>

        {isLoaded && summary && (
          <>
            <Button
              onClick={() => downloadAuditReport(logs, summary)}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </Button>
            <Button
              onClick={clearData}
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Clear Data
            </Button>
          </>
        )}
      </div>

      {isLoaded && (
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <p className="text-sm text-success font-medium">✓ {logs.length} logs loaded and analyzed</p>
          <p className="text-xs text-muted-foreground mt-1">Navigate to Dashboard to explore results</p>
        </div>
      )}
    </div>
  );
}
