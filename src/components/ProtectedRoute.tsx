import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useAdminType } from '@/hooks/useAdminType'
import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { needsOnboarding, loading: profileLoading } = useUserProfile()
  const { adminType, loading: adminLoading } = useAdminType()
  const location = useLocation()

  if (authLoading || profileLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Admins don't need to complete onboarding
  const isAdmin = adminType === 'system_admin' || adminType === 'ngo_admin'

  // If user needs onboarding and they're not already on the onboarding page
  if (!isAdmin && needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  // If user completed onboarding but is still on onboarding page (admins bypass this)
  if (!isAdmin && !needsOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}