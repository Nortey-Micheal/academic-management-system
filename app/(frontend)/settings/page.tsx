import AppLayout from "@/components/layouts/applayout"
import SystemSettingsPage from "@/components/setting-page"

export default async function SettingPage() {
  return (
    <AppLayout>
        <SystemSettingsPage />
    </AppLayout>
  )
}
