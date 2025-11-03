import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminType } from '@/hooks/useAdminType'
import { Users, Activity, BarChart3, Shield, Building2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminStats } from '@/components/admin/AdminStats'
import { UserManagement } from '@/components/admin/UserManagement'
import { ActivityLogsTable } from '@/components/admin/ActivityLogsTable'
import { NGOManagement } from '@/components/admin/NGOManagement'

export default function Admin() {
  const { adminType, ngoId, loading } = useAdminType()
  const navigate = useNavigate()
  
  const isSystemAdmin = adminType === 'system_admin'
  const isNGOAdmin = adminType === 'ngo_admin'
  const hasAdminAccess = isSystemAdmin || isNGOAdmin

  useEffect(() => {
    if (!loading && !hasAdminAccess) {
      navigate('/')
    }
  }, [hasAdminAccess, loading, navigate])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!hasAdminAccess) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            {isSystemAdmin ? 'System Administration' : 'NGO Administration'}
          </p>
        </div>
      </div>

      <AdminStats />

      <Tabs defaultValue={isSystemAdmin ? "users" : "activity"} className="space-y-6">
        <TabsList>
          {isSystemAdmin && (
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          )}
          {isSystemAdmin && (
            <TabsTrigger value="ngos" className="gap-2">
              <Building2 className="h-4 w-4" />
              NGOs
            </TabsTrigger>
          )}
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity Logs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {isSystemAdmin && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}

        {isSystemAdmin && (
          <TabsContent value="ngos">
            <NGOManagement />
          </TabsContent>
        )}

        <TabsContent value="activity">
          <ActivityLogsTable ngoId={isNGOAdmin ? ngoId : undefined} />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View detailed analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
