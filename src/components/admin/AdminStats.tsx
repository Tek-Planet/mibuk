import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { Users, Building2, DollarSign, TrendingUp } from 'lucide-react'
import { useAdminType } from '@/hooks/useAdminType'

export function AdminStats() {
  const { adminType, ngoId } = useAdminType()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalSales: 0,
    activeToday: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let businessesQuery = supabase.from('businesses').select('id', { count: 'exact', head: true })
        let salesQuery = supabase.from('sales').select('total_amount')
        let activityQuery = supabase
          .from('activity_logs')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

        // NGO admins only see their NGO's data
        if (adminType === 'ngo_admin' && ngoId) {
          businessesQuery = businessesQuery.eq('ngo_id', ngoId)
          
          // Get businesses under this NGO first
          const { data: ngoBusinesses } = await supabase
            .from('businesses')
            .select('id')
            .eq('ngo_id', ngoId)
          
          const businessIds = ngoBusinesses?.map(b => b.id) || []
          
          if (businessIds.length > 0) {
            salesQuery = salesQuery.in('business_id', businessIds)
            activityQuery = activityQuery.in('business_id', businessIds)
          } else {
            // No businesses, return zero stats
            setStats({
              totalUsers: 0,
              totalBusinesses: 0,
              totalSales: 0,
              activeToday: 0,
            })
            return
          }
        }

        const [usersRes, businessesRes, salesRes, activityRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          businessesQuery,
          salesQuery,
          activityQuery,
        ])

        const totalSales = salesRes.data?.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0) || 0

        setStats({
          totalUsers: usersRes.count || 0,
          totalBusinesses: businessesRes.count || 0,
          totalSales,
          activeToday: activityRes.count || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [adminType, ngoId])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeToday}</div>
        </CardContent>
      </Card>
    </div>
  )
}
