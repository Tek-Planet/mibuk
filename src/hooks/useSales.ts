import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Sale {
  id: string
  user_id: string
  business_id: string
  customer_id?: string
  invoice_id?: string
  sale_date: string
  total_amount: number
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit'
  notes?: string
  created_at: string
  customer?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
}

export interface CreateSaleData {
  customer_id?: string
  invoice_id?: string
  total_amount: number
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit'
  notes?: string
  sale_date?: string
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSales = async () => {
    try {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to view sales')
      }

      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(id, name, email, phone)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSales((data || []) as Sale[])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales'
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

  const createSale = async (saleData: CreateSaleData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to create sales')
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

      const { data: sale, error } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          business_id: businessId,
          customer_id: saleData.customer_id,
          invoice_id: saleData.invoice_id,
          sale_date: saleData.sale_date || new Date().toISOString().split('T')[0],
          total_amount: saleData.total_amount,
          payment_method: saleData.payment_method,
          notes: saleData.notes
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Sale recorded successfully"
      })

      fetchSales()
      return sale
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sale'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  const updateSale = async (saleId: string, updates: Partial<Sale>) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', saleId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Sale updated successfully"
      })

      fetchSales()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update sale'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  const deleteSale = async (saleId: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Sale deleted successfully"
      })

      fetchSales()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete sale'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  useEffect(() => {
    fetchSales()

    // Set up real-time subscription
    const channel = supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales'
        },
        (payload) => {
          console.log('Sales change detected:', payload)
          fetchSales()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    sales,
    loading,
    error,
    createSale,
    updateSale,
    deleteSale,
    refetch: fetchSales
  }
}