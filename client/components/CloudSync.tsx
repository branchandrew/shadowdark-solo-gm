import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCloudSync } from "@/hooks/useDatabase";
import {
  Cloud,
  CloudOff,
  Download,
  Upload,
  Info,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { clearAllShadowdarkData } from "@/utils/dev-helpers";

export default function CloudSync() {
  const { isEnabled, sessionInfo, toggleCloudSync, exportData, importData } =
    useCloudSync();

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [exportedData, setExportedData] = useState("");
  const [importJson, setImportJson] = useState("");
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    try {
      const data = await exportData();
      setExportedData(JSON.stringify(data, null, 2));
      setShowExportDialog(true);
    } catch (error) {
      alert("Failed to export data: " + (error as Error).message);
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importJson);
      await importData(data);
      setShowImportDialog(false);
      setImportJson("");
      alert("Data imported successfully!");
    } catch (error) {
      alert("Failed to import data: " + (error as Error).message);
    }
  };

  const handleClearData = () => {
    if (
      confirm(
        "Clear all localStorage data? This will reset everything for development.",
      )
    ) {
      clearAllShadowdarkData();
      alert("All data cleared! Refresh the page for a fresh start.");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEnabled ? (
            <Cloud className="h-5 w-5 text-green-600" />
          ) : (
            <CloudOff className="h-5 w-5 text-gray-600" />
          )}
          Cloud Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cloud Sync Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable Cloud Sync</Label>
            <p className="text-xs text-muted-foreground">
              Sync your data across devices
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={toggleCloudSync}
            disabled={!sessionInfo.hasSupabase}
          />
        </div>

        {/* Status Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Status:</Label>
            {sessionInfo.hasSupabase ? (
              <Badge variant={isEnabled ? "default" : "secondary"}>
                {isEnabled ? "Cloud Enabled" : "Local Only"}
              </Badge>
            ) : (
              <Badge variant="outline">Cloud Not Available</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm">Session:</Label>
            <Badge variant="outline" className="font-mono text-xs">
              {sessionInfo.sessionId?.substring(0, 16)}...
            </Badge>
          </div>
        </div>

        {/* Info about cloud sync */}
        {!sessionInfo.hasSupabase && (
          <div className="p-3 border rounded bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Cloud sync not configured
                </p>
                <p className="text-blue-700 dark:text-blue-200 mt-1">
                  To enable cloud sync, add your Supabase credentials to the
                  environment variables.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Export/Import */}
        <div className="flex gap-2">
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Export Game Data</DialogTitle>
                <DialogDescription>
                  Copy this JSON to backup or share your game session.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Game Data (JSON)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={exportedData}
                  readOnly
                  rows={12}
                  className="font-mono text-xs"
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Game Data</DialogTitle>
                <DialogDescription>
                  Paste exported JSON to restore a game session. This will
                  overwrite your current data.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Game Data (JSON)</Label>
                  <Textarea
                    placeholder="Paste exported JSON here..."
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    rows={12}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowImportDialog(false);
                      setImportJson("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={!importJson.trim()}>
                    Import Data
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Instructions for setting up Supabase */}
        {!sessionInfo.hasSupabase && (
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>To enable cloud sync:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create a free Supabase project</li>
              <li>Run the SQL schema from supabase-schema.sql</li>
              <li>
                Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your
                environment
              </li>
              <li>Restart the application</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
