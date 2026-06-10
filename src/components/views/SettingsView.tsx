import { useRef, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useTasks } from '../../hooks/useTasks';
import { exportTasks, downloadExport, validateImportData, mergeImportedTasks } from '../../utils/exportImport';
import { clearAllStorage } from '../../utils/localStorage';
import { APP_NAME, APP_VERSION } from '../../constants/defaults';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Sun, Moon, Monitor, Download, Upload, Trash2 } from 'lucide-react';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import ImportSummaryDialog from '../dialogs/ImportSummaryDialog';

function ThemeOption({ value, label, icon, themeMode, dispatch }: {
  value: 'light' | 'dark' | 'system';
  label: string;
  icon: React.ReactNode;
  themeMode: 'light' | 'dark' | 'system';
  dispatch: React.Dispatch<{ type: 'SET_THEME_MODE'; payload: 'light' | 'dark' | 'system' }>;
}) {
  return (
    <button
      onClick={() => dispatch({ type: 'SET_THEME_MODE', payload: value })}
      className={`flex items-center gap-3 px-4 py-3 rounded-md border transition-colors ${
        themeMode === value
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border hover:bg-accent'
      }`}
      aria-pressed={themeMode === value}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default function SettingsView() {
  const { state: settings, dispatch } = useSettings();
  const { state: taskState, dispatch: taskDispatch } = useTasks();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    open: boolean;
    imported: number;
    skipped: number;
    errors: number;
    errorMessages: string[];
  }>({ open: false, imported: 0, skipped: 0, errors: 0, errorMessages: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportTasks(taskState.tasks);
    downloadExport(data);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const validation = validateImportData(text);
      if (!validation.valid) {
        setImportSummary({
          open: true,
          imported: 0,
          skipped: 0,
          errors: 1,
          errorMessages: validation.error ? [validation.error] : [],
        });
        return;
      }
      if (validation.data) {
        const result = mergeImportedTasks(validation.data.tasks, taskState.tasks);
        taskDispatch({ type: 'SET_TASKS', payload: result.merged });
        setImportSummary({
          open: true,
          imported: result.imported,
          skipped: result.skipped,
          errors: result.errors,
          errorMessages: result.errorMessages,
        });
      }
    } catch {
      setImportSummary({
        open: true,
        imported: 0,
        skipped: 0,
        errors: 1,
        errorMessages: ['Failed to read file.'],
      });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAllData = () => {
    taskDispatch({ type: 'SET_TASKS', payload: [] });
    dispatch({ type: 'RESET_SETTINGS' });
    clearAllStorage();
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-display text-foreground">Settings</h1>

      {/* Appearance */}
      <section className="space-y-4">
        <h2 className="text-section text-foreground">Appearance</h2>
        <div className="flex gap-2">
          <ThemeOption value="light" label="Light" icon={<Sun className="h-4 w-4" />} themeMode={settings.themeMode} dispatch={dispatch} />
          <ThemeOption value="dark" label="Dark" icon={<Moon className="h-4 w-4" />} themeMode={settings.themeMode} dispatch={dispatch} />
          <ThemeOption value="system" label="System" icon={<Monitor className="h-4 w-4" />} themeMode={settings.themeMode} dispatch={dispatch} />
        </div>
      </section>

      <Separator />

      {/* Preferences */}
      <section className="space-y-4">
        <h2 className="text-section text-foreground">Preferences</h2>
        <div>
          <label className="text-sm font-medium mb-2 block">Default View</label>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ type: 'SET_DEFAULT_VIEW', payload: 'today' })}
              className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors ${
                settings.defaultView === 'today'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-accent'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_DEFAULT_VIEW', payload: 'upcoming' })}
              className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors ${
                settings.defaultView === 'upcoming'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-accent'
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>
      </section>

      <Separator />

      {/* Data Management */}
      <section className="space-y-4">
        <h2 className="text-section text-foreground">Data Management</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export Tasks</p>
              <p className="text-xs text-muted-foreground">Download all tasks as a JSON file</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Import Tasks</p>
              <p className="text-xs text-muted-foreground">Upload a JSON file to restore tasks</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              data-testid="file-input"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-semibold text-destructive">Danger Zone</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Clear All Data</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete all tasks, templates, and settings.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowClearConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Everything
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* About */}
      <section className="space-y-2">
        <h2 className="text-section text-foreground">About</h2>
        <p className="text-sm text-muted-foreground">
          {APP_NAME} v{APP_VERSION}
        </p>
      </section>

      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Clear all data?"
        message="This will permanently delete all tasks, templates, and settings. This action cannot be undone."
        confirmText="Clear Everything"
        cancelText="Cancel"
        onConfirm={handleClearAllData}
        variant="destructive"
      />
      <ImportSummaryDialog
        open={importSummary.open}
        onOpenChange={(open) => setImportSummary((prev) => ({ ...prev, open }))}
        imported={importSummary.imported}
        skipped={importSummary.skipped}
        errors={importSummary.errors}
        errorMessages={importSummary.errorMessages}
      />
    </div>
  );
}
