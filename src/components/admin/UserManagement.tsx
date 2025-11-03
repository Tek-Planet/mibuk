import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { Shield, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  created_at: string
  is_admin: boolean
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      // Fetch profiles with user auth data
      const { data, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.error('Auth error:', authError)
        // Fallback to profiles only if auth admin access fails
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, created_at')
          .order('created_at', { ascending: false })

        if (profilesError) throw profilesError

        const userIds = profiles?.map(p => p.user_id) || []
        
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds)

        const adminUserIds = new Set(
          roles?.filter(r => r.role === 'admin' || r.role === 'system_admin').map(r => r.user_id) || []
        )

        const usersWithRoles = profiles?.map(profile => ({
          id: profile.user_id,
          email: 'N/A',
          first_name: profile.first_name,
          last_name: profile.last_name,
          created_at: profile.created_at,
          is_admin: adminUserIds.has(profile.user_id),
        })) || []

        setUsers(usersWithRoles)
        return
      }

      const authUsers = data.users || []
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })

      const userIds = profiles?.map(p => p.user_id) || []
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)

      const adminUserIds = new Set(
        roles?.filter(r => r.role === 'admin' || r.role === 'system_admin').map(r => r.user_id) || []
      )

      const usersWithRoles = profiles?.map(profile => {
        const authUser = authUsers.find(u => u.id === profile.user_id)
        return {
          id: profile.user_id,
          email: authUser?.email || 'N/A',
          first_name: profile.first_name,
          last_name: profile.last_name,
          created_at: profile.created_at,
          is_admin: adminUserIds.has(profile.user_id),
        }
      }) || []

      setUsers(usersWithRoles)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    try {
      if (currentlyAdmin) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin')

        if (error) throw error
        toast.success('Admin access removed')
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' })

        if (error) throw error
        toast.success('Admin access granted')
      }

      fetchUsers()
    } catch (error) {
      console.error('Error toggling admin:', error)
      toast.error('Failed to update user role')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">
                      {user.first_name || user.last_name
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : 'No name'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={user.is_admin ? 'destructive' : 'default'}
                      onClick={() => toggleAdmin(user.id, user.is_admin)}
                    >
                      {user.is_admin ? (
                        <>
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Remove Admin
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
