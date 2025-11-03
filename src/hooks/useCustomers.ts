import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Customer {
  id: string
  user_id: string
  business_id: string
  name: string
  email?: string
  phone?: string
  address?: string
  business_type?: string
  credit_limit?: number
  current_balance?: number
  birthday?: string
  created_at: string
  updated_at: string
}

interface CreateCustomerData {
  name: string
  email?: string
  phone?: string
  address?: string
  business_type?: string
  credit_limit?: number
  birthday?: string
}

export function useCustomers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    if (!user) {
      setCustomers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching customers:', error)
        setError('Failed to fetch customers')
        toast.error('Failed to fetch customers')
        return
      }

      setCustomers(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('Failed to fetch customers')
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (customerData: CreateCustomerData) => {
    if (!user) {
      toast.error('User not authenticated')
      return false
    }

    try {
      // Get or create business
      let { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)

      let businessId = businesses?.[0]?.id

      if (!businessId) {
        const { data: newBusiness, error: businessError } = await supabase
          .from('businesses')
          .insert([{
            owner_id: user.id,
            business_name: 'My Business',
            business_type: 'retail'
          }])
          .select('id')
          .single()

        if (businessError) {
          console.error('Error creating business:', businessError)
          toast.error('Failed to create business')
          return false
        }

        businessId = newBusiness.id
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([{
          user_id: user.id,
          business_id: businessId,
          ...customerData
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating customer:', error)
        toast.error('Failed to create customer')
        return false
      }

      await fetchCustomers()
      toast.success('Customer created successfully')
      return true
    } catch (err) {
      console.error('Error creating customer:', err)
      toast.error('Failed to create customer')
      return false
    }
  }

  const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', customerId)

      if (error) {
        console.error('Error updating customer:', error)
        toast.error('Failed to update customer')
        return false
      }

      await fetchCustomers()
      toast.success('Customer updated successfully')
      return true
    } catch (err) {
      console.error('Error updating customer:', err)
      toast.error('Failed to update customer')
      return false
    }
  }

  const deleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) {
        console.error('Error deleting customer:', error)
        toast.error('Failed to delete customer')
        return false
      }

      await fetchCustomers()
      toast.success('Customer deleted successfully')
      return true
    } catch (err) {
      console.error('Error deleting customer:', err)
      toast.error('Failed to delete customer')
      return false
    }
  }

  useEffect(() => {
    fetchCustomers()

    // Set up real-time subscription
    const channel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('Customer change detected:', payload)
          fetchCustomers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  }
}