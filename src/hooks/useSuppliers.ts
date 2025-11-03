import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Supplier {
  id: string
  user_id: string
  business_id: string
  name: string
  phone?: string
  location?: string
  product_category?: string
  notes?: string
  current_balance: number
  created_at: string
  updated_at: string
}

export interface CreateSupplierData {
  name: string
  phone?: string
  location?: string
  product_category?: string
  notes?: string
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSuppliers = async () => {
    try {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to view suppliers')
      }

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setSuppliers(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suppliers'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createSupplier = async (supplierData: CreateSupplierData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to create suppliers')
      }

      // Get business ID
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)

      let businessId: string
      if (!businesses || businesses.length === 0) {
        const { data: newBusiness } = await supabase
          .from('businesses')
          .insert({
            owner_id: user.id,
            business_name: 'My Business',
            business_type: 'retail',
            currency: 'SLL'
          })
          .select('id')
          .single()

        if (!newBusiness) throw new Error('Failed to create business')
        businessId = newBusiness.id
      } else {
        businessId = businesses[0].id
      }

      const { data: supplier, error } = await supabase
        .from('suppliers')
        .insert({
          user_id: user.id,
          business_id: businessId,
          ...supplierData
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Supplier created successfully"
      })

      fetchSuppliers()
      return supplier
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create supplier'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  const updateSupplier = async (supplierId: string, updates: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', supplierId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Supplier updated successfully"
      })

      fetchSuppliers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update supplier'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  const deleteSupplier = async (supplierId: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Supplier deleted successfully"
      })

      fetchSuppliers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete supplier'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  useEffect(() => {
    fetchSuppliers()

    // Set up real-time subscription
    const channel = supabase
      .channel('suppliers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'suppliers'
      }, () => {
        fetchSuppliers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers
  }
}