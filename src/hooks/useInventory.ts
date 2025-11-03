import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from './useUserProfile'
import { toast } from '@/hooks/use-toast'

export interface InventoryItem {
  id: string
  name: string
  category?: string
  sku?: string
  barcode?: string
  description?: string
  unit_price: number
  cost_price?: number
  stock_quantity: number
  min_stock_level?: number
  supplier?: string
  location?: string
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface InventoryFormData {
  name: string
  category?: string
  sku?: string
  barcode?: string
  description?: string
  unit_price: number
  cost_price?: number
  stock_quantity: number
  min_stock_level?: number
  supplier?: string
  location?: string
  is_active?: boolean
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { business } = useUserProfile()

  const fetchInventory = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInventory(data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory items',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const addInventoryItem = async (itemData: InventoryFormData) => {
    if (!user || !business) return

    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          ...itemData,
          user_id: user.id,
          business_id: business.id
        })
        .select()
        .single()

      if (error) throw error

      setInventory(prev => [data, ...prev])
      toast({
        title: 'Success',
        description: 'Inventory item added successfully'
      })
      return data
    } catch (error) {
      console.error('Error adding inventory item:', error)
      toast({
        title: 'Error',
        description: 'Failed to add inventory item',
        variant: 'destructive'
      })
      throw error
    }
  }

  const updateInventoryItem = async (id: string, updates: Partial<InventoryFormData>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setInventory(prev => prev.map(item => 
        item.id === id ? { ...item, ...data } : item
      ))
      toast({
        title: 'Success',
        description: 'Inventory item updated successfully'
      })
      return data
    } catch (error) {
      console.error('Error updating inventory item:', error)
      toast({
        title: 'Error',
        description: 'Failed to update inventory item',
        variant: 'destructive'
      })
      throw error
    }
  }

  const deleteInventoryItem = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setInventory(prev => prev.filter(item => item.id !== id))
      toast({
        title: 'Success',
        description: 'Inventory item deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting inventory item:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete inventory item',
        variant: 'destructive'
      })
      throw error
    }
  }

  const updateStock = async (id: string, newQuantity: number) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({ stock_quantity: Math.max(0, newQuantity) })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setInventory(prev => prev.map(item => 
        item.id === id ? { ...item, stock_quantity: data.stock_quantity } : item
      ))
    } catch (error) {
      console.error('Error updating stock:', error)
      toast({
        title: 'Error',
        description: 'Failed to update stock quantity',
        variant: 'destructive'
      })
      throw error
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [user])

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock_quantity <= 0) return 'out'
    if (item.stock_quantity <= 3) return 'critical'
    if (item.min_stock_level && item.stock_quantity < item.min_stock_level) return 'low'
    return 'good'
  }

  const criticalItems = inventory.filter(item => getStockStatus(item) === 'critical').length
  const lowItems = inventory.filter(item => getStockStatus(item) === 'low').length
  const outOfStockItems = inventory.filter(item => getStockStatus(item) === 'out').length
  const totalValue = inventory.reduce((sum, item) => sum + (item.stock_quantity * item.unit_price), 0)

  return {
    inventory,
    loading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock,
    fetchInventory,
    getStockStatus,
    criticalItems,
    lowItems,
    outOfStockItems,
    totalValue
  }
}