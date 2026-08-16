import { SettingsView } from "@/components/settings/settings-view";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Settings</h1>
        <p className="mt-2 text-zinc-400">Manage your account, preferences, and data.</p>
      </header>

      <SettingsView />
    </div>
  );
}
