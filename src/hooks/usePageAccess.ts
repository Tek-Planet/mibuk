import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from './useUserProfile'

export function usePageAccess() {
  const { user } = useAuth()
  const { business } = useUserProfile()
  const [accessiblePages, setAccessiblePages] = useState<string[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !business?.id) {
        setLoading(false)
        return
      }

      try {
        // Check if user is the owner
        const { data: businessData } = await supabase
          .from('businesses')
          .select('owner_id')
          .eq('id', business.id)
          .single()

        if (businessData?.owner_id === user.id) {
          setIsOwner(true)
          setAccessiblePages(['all']) // Owner has access to everything
          setLoading(false)
          return
        }

        // Check member access
        const { data: memberData } = await supabase
          .from('organization_members')
          .select('accessible_pages')
          .eq('business_id', business.id)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (memberData) {
          setAccessiblePages(memberData.accessible_pages || [])
        }
      } catch (error) {
        console.error('Error checking page access:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, business?.id])

  const hasPageAccess = (page: string): boolean => {
    if (isOwner) return true
    return accessiblePages.includes(page)
  }

  return {
    accessiblePages,
    isOwner,
    loading,
    hasPageAccess
  }
}
