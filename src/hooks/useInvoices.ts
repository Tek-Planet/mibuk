import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Invoice {
  id: string
  user_id: string
  business_id: string
  customer_id?: string
  invoice_number: string
  invoice_date: string
  due_date?: string
  subtotal: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
  customer?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  invoice_items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id?: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface CreateInvoiceData {
  customer_id?: string
  due_date?: string
  notes?: string
  items: {
    product_id?: string
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }[]
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchInvoices = async () => {
    try {
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to view invoices')
      }

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(id, name, email, phone),
          invoice_items(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setInvoices((data || []) as Invoice[])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoices'
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

  const createInvoice = async (invoiceData: CreateInvoiceData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to create invoices')
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

      // Calculate totals
      const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total_price, 0)
      const tax_amount = subtotal * 0.15 // 15% tax
      const total_amount = subtotal + tax_amount

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          business_id: businessId,
          customer_id: invoiceData.customer_id,
          invoice_number: invoiceNumber,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: invoiceData.due_date,
          subtotal,
          tax_amount,
          total_amount,
          paid_amount: 0,
          status: 'draft',
          notes: invoiceData.notes
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice items
      const itemsWithInvoiceId = invoiceData.items.map(item => ({
        invoice_id: invoice.id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        // Only include product_id if it exists and is valid
        ...(item.product_id && { product_id: item.product_id })
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId)

      if (itemsError) throw itemsError

      toast({
        title: "Success",
        description: "Invoice created successfully"
      })

      fetchInvoices()
      return invoice
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', invoiceId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Invoice updated successfully"
      })

      fetchInvoices()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  const deleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Invoice deleted successfully"
      })

      fetchInvoices()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      throw err
    }
  }

  useEffect(() => {
    fetchInvoices()

    // Set up real-time subscription for invoices
    const invoicesChannel = supabase
      .channel('invoices-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'invoices'
      }, () => {
        fetchInvoices()
      })
      .subscribe()

    // Set up real-time subscription for invoice items
    const itemsChannel = supabase
      .channel('invoice-items-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'invoice_items'
      }, () => {
        fetchInvoices()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(invoicesChannel)
      supabase.removeChannel(itemsChannel)
    }
  }, [])

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refetch: fetchInvoices
  }
}