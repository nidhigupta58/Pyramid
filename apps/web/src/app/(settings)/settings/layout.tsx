import { SettingsSidebar } from "@/components/settings/settings-sidebar";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <SettingsSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
