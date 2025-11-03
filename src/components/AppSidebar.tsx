import { LayoutDashboard, FileText, Users, Package, TrendingUp, CreditCard, BarChart3, Settings, Truck, Receipt, Shield } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useLanguage } from '@/contexts/LanguageContext'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePageAccess } from '@/hooks/usePageAccess'
import { useAdminType } from '@/hooks/useAdminType'

const PAGE_ROUTE_MAP: Record<string, string> = {
  'dashboard': '/',
  'sales': '/sales',
  'invoices': '/invoices',
  'customers': '/customers',
  'inventory': '/inventory',
  'suppliers': '/suppliers',
  'expenses': '/expenses',
  'credit': '/credit',
  'reports': '/reports',
  'settings': '/settings'
}

const getMenuItems = (t: (key: string) => string) => [
  { title: t('nav.dashboard'), url: '/', icon: LayoutDashboard, pageKey: 'dashboard' },
  { title: t('nav.sales'), url: '/sales', icon: TrendingUp, pageKey: 'sales' },
  { title: t('nav.invoices'), url: '/invoices', icon: FileText, pageKey: 'invoices' },
  { title: t('nav.customers'), url: '/customers', icon: Users, pageKey: 'customers' },
  { title: t('nav.inventory'), url: '/inventory', icon: Package, pageKey: 'inventory' },
  { title: t('nav.suppliers'), url: '/suppliers', icon: Truck, pageKey: 'suppliers' },
  { title: t('nav.expenses'), url: '/expenses', icon: Receipt, pageKey: 'expenses' },
  { title: t('nav.credit'), url: '/credit', icon: CreditCard, pageKey: 'credit' },
  { title: t('nav.reports'), url: '/reports', icon: BarChart3, pageKey: 'reports' },
  { title: t('nav.settings'), url: '/settings', icon: Settings, pageKey: 'settings' },
]

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar()
  const location = useLocation()
  const { t } = useLanguage()
  const isMobile = useIsMobile()
  const { hasPageAccess, loading } = usePageAccess()
  const { adminType } = useAdminType()
  const hasAdminAccess = adminType === 'system_admin' || adminType === 'ngo_admin'
  const currentPath = location.pathname
  const isCollapsed = state === 'collapsed'
  const menuItems = getMenuItems(t)

  const isActive = (path: string) => currentPath === path

  const handleNavClick = () => {
    // Close sidebar on mobile when a navigation item is clicked
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Filter menu items based on page access
  const visibleMenuItems = menuItems.filter(item => {
    if (loading) return true // Show all while loading
    return hasPageAccess(item.pageKey)
  })

  return (
    <Sidebar side="left" className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent className="bg-card border-r pt-[env(safe-area-inset-top)]">
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">MB</span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">MiBuks</h2>
                <p className="text-xs text-muted-foreground">Business Hub</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            {t('nav.mainmenu')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      end
                      onClick={handleNavClick}
                      className="flex items-center gap-3 px-3 py-2 text-sm"
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hasAdminAccess && (
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/admin"
                      onClick={handleNavClick}
                      className="flex items-center gap-3 px-3 py-2 text-sm"
                    >
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Admin Panel</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}