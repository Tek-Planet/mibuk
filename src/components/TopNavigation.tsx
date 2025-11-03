import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function TopNavigation() {
  const { t } = useLanguage()
  const { user, signOut } = useAuth()
  const { business, loading } = useUserProfile()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery}`)
      // TODO: Implement global search functionality
    }
  }

  const handleNotifications = () => {
    toast.info('No new notifications')
    // TODO: Implement notifications system
  }

  const handleProfile = () => {
    navigate('/settings')
  }

  const handleSettings = () => {
    navigate('/settings')
  }
  return (
    <header className="sticky top-0 z-50 min-h-14 sm:min-h-16 pt-[env(safe-area-inset-top)] border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <SidebarTrigger />
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
            className="pl-10 w-60 lg:w-80 bg-background/50"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Search Button */}
        <Button variant="ghost" size="sm" className="sm:hidden" onClick={() => toast.info('Mobile search coming soon')}>
          <Search className="h-4 w-4" />
        </Button>
        
        {/* Language Switch */}
        <LanguageSwitch />
        
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative" onClick={handleNotifications}>
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-destructive rounded-full"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-1 sm:p-2">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium truncate max-w-32">
                  {loading ? t('business.defaultname') : (business?.business_name || t('business.defaultname'))}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-32">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background z-50">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{t('common.profile')}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile}>
              <User className="mr-2 h-4 w-4" />
              {t('common.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings}>
              <Settings className="mr-2 h-4 w-4" />
              {t('nav.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              {t('common.signout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}