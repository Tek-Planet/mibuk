import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

interface UserProfile {
  user_id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
}

interface Business {
  id: string
  owner_id: string
  business_name: string
  business_type: string | null
  address: string | null
  phone: string | null
  email: string | null
  currency: string | null
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const { user } = useAuth()

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setBusiness(null)
      setNeedsOnboarding(false)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
      }

      setProfile(profileData)

      // First, check if user owns a business
      const { data: ownedBusiness, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (businessError && businessError.code !== 'PGRST116') {
        console.error('Error fetching business:', businessError)
      }

      if (ownedBusiness) {
        // User owns a business
        setBusiness(ownedBusiness)
        setNeedsOnboarding(!profileData || !ownedBusiness)
      } else {
        // Check if user is a member of an organization
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .select('business_id, businesses(*)')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()

        if (memberError && memberError.code !== 'PGRST116') {
          console.error('Error fetching organization membership:', memberError)
        }

        if (memberData?.businesses) {
          // User is a team member - cast to Business type
          setBusiness(memberData.businesses as any)
          setNeedsOnboarding(false) // Team members don't need onboarding
        } else {
          // User has no business association - needs onboarding
          setBusiness(null)
          setNeedsOnboarding(true)
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  useEffect(() => {
    const handleInvalidate = () => {
      fetchUserData()
    }
    window.addEventListener('user-data-updated', handleInvalidate)
    return () => {
      window.removeEventListener('user-data-updated', handleInvalidate)
    }
  }, [fetchUserData])


  const refetch = async () => {
    if (!user) {
      return
    }

    setLoading(true)
    
    try {
      // Add a small delay to ensure database operations are completed
      await new Promise(resolve => setTimeout(resolve, 500))

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
      }

      setProfile(profileData)

      // First, check if user owns a business
      const { data: ownedBusiness, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (businessError && businessError.code !== 'PGRST116') {
        console.error('Error fetching business:', businessError)
      }

      let hasBusiness = false
      let stillNeedsOnboarding = true

      if (ownedBusiness) {
        // User owns a business
        setBusiness(ownedBusiness)
        hasBusiness = true
        stillNeedsOnboarding = !profileData || !ownedBusiness
      } else {
        // Check if user is a member of an organization
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .select('business_id, businesses(*)')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()

        if (memberError && memberError.code !== 'PGRST116') {
          console.error('Error fetching organization membership:', memberError)
        }

        if (memberData?.businesses) {
          // User is a team member
          setBusiness(memberData.businesses as any)
          hasBusiness = true
          stillNeedsOnboarding = false // Team members don't need onboarding
        } else {
          // User has no business association - needs onboarding
          setBusiness(null)
          stillNeedsOnboarding = true
        }
      }
      
      setNeedsOnboarding(stillNeedsOnboarding)
      
      return { hasProfile: !!profileData, hasBusiness, needsOnboarding: stillNeedsOnboarding }

    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    business,
    loading,
    needsOnboarding,
    refetch
  }
}