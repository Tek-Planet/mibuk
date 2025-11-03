import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { TopNavigation } from '@/components/TopNavigation'

export function Layout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavigation />
          <main className="flex-1 p-3 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}