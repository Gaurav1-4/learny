import { SettingsView } from "@/components/settings/settings-view";

export default function SettingsPage() {
  return (
    <div className="space-y-5 max-w-4xl">
      <header className="border-b border-zinc-800 pb-3">
        <div className="text-[11px] font-medium text-zinc-500">Preferences &amp; Account</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
          Settings &amp; Backup
        </h1>
      </header>

      <SettingsView />
    </div>
  );
}
