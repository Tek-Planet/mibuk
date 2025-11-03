import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface ActivityLog {
  id: string
  user_id: string
  business_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export function useActivityLogs(limit = 50) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        setLogs(data || [])
      } catch (error) {
        console.error('Error fetching activity logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()

    const subscription = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'activity_logs' }, 
        () => {
          fetchLogs()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [limit])

  return { logs, loading }
}

export async function logActivity(
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: any
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  try {
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}
