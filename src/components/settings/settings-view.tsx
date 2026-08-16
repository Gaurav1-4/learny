"use client";

import { useState, useEffect } from "react";
import { Save, Download, Upload, AlertTriangle, RefreshCw, Palette, Cloud, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";

const COLORS = [
  { name: "Indigo", value: "indigo", hex: "#4f46e5" },
  { name: "Emerald", value: "emerald", hex: "#10b981" },
  { name: "Violet", value: "violet", hex: "#8b5cf6" },
  { name: "Rose", value: "rose", hex: "#f43f5e" },
  { name: "Amber", value: "amber", hex: "#f59e0b" },
  { name: "Cyan", value: "cyan", hex: "#06b6d4" },
];

export function SettingsView() {
  const { data: session } = useSession();
  const [themeColor, setThemeColor] = useState("indigo");
  const [isClient, setIsClient] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem("learny_theme") || "indigo";
    setThemeColor(savedTheme);
  }, []);

  const handleThemeChange = (color: string) => {
    setThemeColor(color);
    localStorage.setItem("learny_theme", color);
    // In a real app, this might update CSS variables on the document root
    document.documentElement.setAttribute('data-theme', color);
  };

  const handleExport = () => {
    try {
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("learny_")) {
          data[key] = localStorage.getItem(key) || "";
        }
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learny-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportMessage("Backup downloaded successfully!");
      setTimeout(() => setExportMessage(""), 3000);
    } catch (error) {
      console.error("Export failed:", error);
      setExportMessage("Failed to export data.");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith("learny_") && typeof value === "string") {
            localStorage.setItem(key, value);
          }
        });
        
        alert("Backup restored successfully! The page will reload.");
        window.location.reload();
      } catch (error) {
        console.error("Import failed:", error);
        alert("Invalid backup file. Please make sure it's a valid JSON export from Learny.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
  };

  const handleReset = () => {
    if (confirm("Are you absolutely sure? This will delete all your local data including GPA records, study decks, and timers. This action cannot be undone.")) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("learny_")) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      alert("All data reset successfully! The page will reload.");
      window.location.reload();
    }
  };

  if (!isClient) return null;

  return (
    <div className="space-y-8">
      {/* Theme Customizer */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-zinc-400" />
          <h2 className="text-xl font-semibold text-zinc-100">Theme Customizer</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6">Choose a primary accent color for your workspace.</p>
        
        <div className="flex flex-wrap gap-4">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleThemeChange(color.value)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                themeColor === color.value 
                  ? "bg-zinc-800 ring-2 ring-zinc-400 text-white" 
                  : "bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <div 
                className="h-4 w-4 rounded-full" 
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
            </button>
          ))}
        </div>
      </section>

      {/* Google Classroom Integration */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="h-5 w-5 text-zinc-400" />
          <h2 className="text-xl font-semibold text-zinc-100">Google Classroom</h2>
        </div>
        
        <div className="space-y-4">
          {session?.user ? (
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-medium text-white mb-1">Connected Account</div>
                <div className="text-sm text-zinc-400">{session.user.email}</div>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                Active Session
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
              <div className="font-medium text-white mb-1">Not Connected</div>
              <div className="text-sm text-zinc-400">Sign in to sync your classroom courses and assignments.</div>
            </div>
          )}
          
          <div className="text-sm text-zinc-500">
            Note: To fully enable syncing, ensure you have set up your Google Cloud Credentials with the correct scopes for Google Classroom API and updated your environment variables.
          </div>
        </div>
      </section>

      {/* Data Management & Backup */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-zinc-400" />
          <h2 className="text-xl font-semibold text-zinc-100">Data & Backup</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6">Manage your local storage data. Learny stores most of your data locally on this device.</p>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
            <div>
              <div className="font-medium text-white">Export Full Backup</div>
              <div className="text-sm text-zinc-500 mt-1">Download all your local data as a JSON file.</div>
            </div>
            <div className="flex items-center gap-3">
              {exportMessage && <span className="text-xs text-emerald-400">{exportMessage}</span>}
              <Button onClick={handleExport} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800">
            <div>
              <div className="font-medium text-white">Restore Backup</div>
              <div className="text-sm text-zinc-500 mt-1">Upload a previously exported JSON backup file.</div>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="backup-upload"
              />
              <Label 
                htmlFor="backup-upload"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 hover:text-zinc-100 h-9 px-4 py-2 cursor-pointer"
              >
                <Upload className="h-4 w-4" /> Restore
              </Label>
            </div>
          </div>

          <Separator className="bg-zinc-800 my-4" />

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-red-950/20 rounded-lg border border-red-900/30">
            <div>
              <div className="font-medium text-red-400">Reset All Local Data</div>
              <div className="text-sm text-red-400/70 mt-1">Permanently delete all your local settings, records, and data.</div>
            </div>
            <Button onClick={handleReset} variant="destructive" className="gap-2">
              <AlertTriangle className="h-4 w-4" /> Reset Data
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
