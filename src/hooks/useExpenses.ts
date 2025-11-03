import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Expense {
  id: string
  user_id: string
  business_id: string
  supplier_id?: string
  description: string
  amount: number
  payment_method: string
  category?: string
  expense_date: string
  notes?: string
  created_at: string
  updated_at: string
  supplier?: {
    id: string
    name: string
  }
}

export interface CreateExpenseData {
  supplier_id?: string
  description: string
  amount: number
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit'
  category?: string
  expense_date?: string
  notes?: string
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchExpenses = async () => {
    try {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to view expenses')
      }

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          supplier:suppliers!expenses_supplier_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setExpenses((data || []) as any[])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch expenses'
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

  const createExpense = async (expenseData: CreateExpenseData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to create expenses')
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

      const { data: expense, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          business_id: businessId,
          expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
          ...expenseData
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Expense recorded successfully"
      })

      fetchExpenses()
      return expense
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expense'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  const updateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', expenseId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Expense updated successfully"
      })

      fetchExpenses()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  const deleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Expense deleted successfully"
      })

      fetchExpenses()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  useEffect(() => {
    fetchExpenses()

    // Set up real-time subscription
    const channel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses'
      }, () => {
        fetchExpenses()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses
  }
}