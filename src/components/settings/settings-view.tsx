"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Download,
  Upload,
  AlertTriangle,
  RefreshCw,
  Palette,
  Cloud,
  Database,
  User,
  ShieldCheck,
  Key,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

  // Student Profile State
  const [name, setName] = useState("Gaurav");
  const [institute, setInstitute] = useState("IIIT Delhi");
  const [branch, setBranch] = useState("B.Tech Computer Science & Design (CSD)");
  const [semester, setSemester] = useState("3");
  const [porList, setPorList] = useState("Design Lead / Student Representative, CSD 2024-2028 Cohort");
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem("learny_theme") || "indigo";
    setThemeColor(savedTheme);

    const savedProfile = localStorage.getItem("learny_student_profile");
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        if (p.name) setName(p.name);
        if (p.institute) setInstitute(p.institute);
        if (p.branch) setBranch(p.branch);
        if (p.semester) setSemester(p.semester);
        if (p.positionsOfResponsibility) {
          setPorList(Array.isArray(p.positionsOfResponsibility) ? p.positionsOfResponsibility.join(", ") : p.positionsOfResponsibility);
        }
      } catch (e) {}
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = {
      name,
      institute,
      branch,
      semester: parseInt(semester, 10) || 3,
      positionsOfResponsibility: porList.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
    };
    localStorage.setItem("learny_student_profile", JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleThemeChange = (color: string) => {
    setThemeColor(color);
    localStorage.setItem("learny_theme", color);
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
        
        window.location.reload();
      } catch (error) {
        console.error("Import failed:", error);
        alert("Failed to restore backup. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to delete all local data? This action cannot be undone.")) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("learny_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      window.location.reload();
    }
  };

  if (!isClient) return null;

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your academic profile, 9-Key AI Pool, cloud accounts, and data.</p>
      </div>

      {/* 1. Student Academic Profile & POR Editor */}
      <section className="rounded-2xl border border-indigo-500/30 bg-zinc-900/90 p-6 space-y-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-zinc-100">Student Profile & Positions of Responsibility</h2>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs">
            Personalizes AI Email Filtering
          </Badge>
        </div>
        <p className="text-xs text-zinc-400">
          The 9-Key Gemini Filter Agent uses this profile to block irrelevant college broadcasts and prioritize emails affecting your 3rd Sem CSD courses or leadership roles.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">College / University</Label>
              <Input
                value={institute}
                onChange={(e) => setInstitute(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Branch / Major</Label>
              <Input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Current Semester</Label>
              <Input
                type="number"
                min="1"
                max="8"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-300">Positions of Responsibility (POR) & Club Roles (Comma Separated)</Label>
            <Input
              value={porList}
              onChange={(e) => setPorList(e.target.value)}
              placeholder="e.g. Design Lead, Placement Volunteer, Student Council Rep"
              className="bg-zinc-950 border-zinc-800 text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-zinc-500">
              Active Subjects: Math III, OS, AP, DPP 2026, RMSSD
            </span>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5">
              {profileSaved ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Saved!
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save Academic Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* 2. 9-Key Gemini AI Load-Balancing Pool */}
      <section className="rounded-2xl border border-emerald-500/30 bg-zinc-900/90 p-6 space-y-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-zinc-100">9-Key Gemini Auto-Rotation Pool</h2>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
            13,500 Free Requests / Day
          </Badge>
        </div>
        <p className="text-xs text-zinc-400">
          Load-balances incoming requests across all 9 Google AI Studio keys with zero-lag 0ms 429 rate-limit failover.
        </p>

        <div className="grid gap-2 sm:grid-cols-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div key={num} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-zinc-300 font-bold">Key #{num}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Healthy (1,500/d)</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Google Accounts & Cloud Storage */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="h-5 w-5 text-indigo-400" />
          <h2 className="text-xl font-semibold text-zinc-100">Connected Google Accounts & Cloud Storage</h2>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Primary Classroom & Gmail Account */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Academic Classroom & Gmail
              </span>
              <div className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
                Active Session
              </div>
            </div>
            <div className="font-medium text-white text-sm truncate">
              {session?.user?.email || "gaurav25212@iiitd.ac.in"}
            </div>
            <div className="text-[11px] text-zinc-500">
              Syncs Google Classroom courses, coursework, grades, and college academic emails.
            </div>
          </div>

          {/* 5 TB Storage & NotebookLM Account */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                NotebookLM & Cloud Storage
              </span>
              <div className="px-2.5 py-0.5 bg-purple-500/15 text-purple-300 text-[10px] font-bold rounded-full border border-purple-500/30">
                5 TB Storage
              </div>
            </div>
            <div className="font-medium text-purple-200 text-sm font-mono truncate">
              studyonly.co@gmail.com
            </div>
            <div className="text-[11px] text-zinc-500">
              5 TB Google Drive storage, source uploads, and AI Deep Audio Overview synthesis.
            </div>
          </div>
        </div>
      </section>

      {/* 4. Appearance & Theme Customizer */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-zinc-400" />
          <h2 className="text-xl font-semibold text-zinc-100">Appearance</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6">Customize the look and feel of Learny.</p>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-zinc-200">Theme Color Accent</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleThemeChange(color.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                    themeColor === color.value 
                      ? "border-zinc-100 bg-zinc-800 text-white ring-2 ring-zinc-400" 
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div 
                    className="h-6 w-6 rounded-full mb-2 border border-zinc-700" 
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Data Management & Backup */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
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
