import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { ShoppingCart, Plus, Save, Calculator } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSales } from '@/hooks/useSales'
import { useInventory } from '@/hooks/useInventory'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

interface SaleItem {
  product_id?: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  maxStock: number
}

export function RecordSaleModal({ onSaleCreated }: { onSaleCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [saleData, setSaleData] = useState({
    customer_id: 'walk-in',
    payment_method: 'cash' as 'cash' | 'mobile_money' | 'bank_transfer' | 'credit',
    notes: ''
  })
  const [items, setItems] = useState<SaleItem[]>([
    { product_name: '', quantity: 1, unit_price: 0, total_price: 0, maxStock: 0 }
  ])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  const { createSale } = useSales()
  const { inventory } = useInventory()
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    console.log('Items state:', items)
    console.log('Button disabled?', loading || !items.some(item => item.product_name))
    console.log('Has product names?', items.some(item => item.product_name))
  }, [items, loading])

  useEffect(() => {
    console.log('Inventory:', inventory)
  }, [inventory])

  const fetchCustomers = async () => {
    try {
      const { data } = await supabase
        .from('customers')
        .select('id, name, email, phone')
        .order('name')
      
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const addItem = () => {
    setItems([...items, { product_name: '', quantity: 1, unit_price: 0, total_price: 0, maxStock: 0 }])
  }

  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    setItems((prev) => {
      const newItems = [...prev]
      const current = newItems[index] ?? { product_name: '', quantity: 1, unit_price: 0, total_price: 0, maxStock: 0 }
      const updated: SaleItem = { ...current, [field]: value } as SaleItem

      if (field === 'quantity' || field === 'unit_price') {
        updated.total_price = Number(updated.quantity) * Number(updated.unit_price)
      }

      newItems[index] = updated
      return newItems
    })
  }

  const selectProduct = (index: number, productId: string) => {
    console.log('selectProduct called with:', { index, productId })
    const product = inventory.find(p => p.id === productId)
    console.log('Found product:', product)
    if (product) {
      setItems((prev) => {
        const newItems = [...prev]
        const current = newItems[index] ?? { product_name: '', quantity: 1, unit_price: 0, total_price: 0, maxStock: 0 }
        const quantity = current.quantity || 1
        const updated: SaleItem = {
          ...current,
          product_id: productId,
          product_name: product.name,
          unit_price: product.unit_price,
          maxStock: product.stock_quantity,
          total_price: Number(product.unit_price) * Number(quantity),
        }
        newItems[index] = updated
        return newItems
      })
      console.log('Updated item with product_name:', product.name)
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
  const total = subtotal - discount

  const handleSave = async () => {
    if (total <= 0) {
      toast({
        title: "Error",
        description: "Please add at least one item with a positive total",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await createSale({
        customer_id: saleData.customer_id === 'walk-in' ? undefined : saleData.customer_id,
        total_amount: total,
        payment_method: saleData.payment_method,
        notes: saleData.notes || undefined
      })

      // Notify parent to refresh
      onSaleCreated?.()

      // Reset form
      setSaleData({
        customer_id: 'walk-in',
        payment_method: 'cash',
        notes: ''
      })
      setItems([{ product_name: '', quantity: 1, unit_price: 0, total_price: 0, maxStock: 0 }])
      setDiscount(0)
      setOpen(false)
    } catch (error) {
      console.error('Error creating sale:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(openState) => {
      console.log('Dialog open state changed:', openState)
      setOpen(openState)
    }}>
      <DialogTrigger asChild>
        <Button variant="gradient" onClick={() => console.log('Record Sale button clicked')}>
          <Plus className="h-4 w-4" />
          Record Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Record New Sale
          </DialogTitle>
          <DialogDescription>
            Fill in customer, items, and payment to record this sale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Sale Header */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select value={saleData.customer_id} onValueChange={(value) => setSaleData({...saleData, customer_id: value})}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                  {customers.filter(customer => customer.id && customer.id.trim() !== '').map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="payment">Payment Method</Label>
              <Select value={saleData.payment_method} onValueChange={(value) => setSaleData({...saleData, payment_method: value as any})}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input 
                id="notes"
                placeholder="Additional notes..."
                value={saleData.notes}
                onChange={(e) => setSaleData({...saleData, notes: e.target.value})}
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* Sale Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>Sale Items</span>
                <Button size="sm" onClick={addItem} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Item {index + 1}</span>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label>Product</Label>
                          <Select 
                            onValueChange={(value) => {
                              console.log('Product selected:', value)
                              selectProduct(index, value)
                            }}
                            value={item.product_id || ""}
                          >
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent className="z-50 bg-background">
                              {inventory.filter(product => product.id && product.id.trim() !== '').map(product => (
                                <SelectItem 
                                  key={product.id} 
                                  value={product.id}
                                  disabled={product.stock_quantity === 0}
                                >
                                  {product.name} {product.stock_quantity === 0 ? '(Out of Stock)' : `(${product.stock_quantity} left)`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label>Quantity</Label>
                          <Input 
                            type="number"
                            value={item.quantity}
                            min="1"
                            max={item.maxStock > 0 ? item.maxStock : undefined}
                            onChange={(e) => {
                              const inputValue = parseInt(e.target.value) || 1
                              const qty = item.maxStock > 0 ? Math.min(inputValue, item.maxStock) : inputValue
                              updateItem(index, 'quantity', qty)
                            }}
                            className="h-12 text-base"
                          />
                          {item.maxStock > 0 && (
                            <p className="text-xs text-muted-foreground">Max: {item.maxStock}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label>Price (Le)</Label>
                          <Input 
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="h-12 text-base"
                          />
                        </div>
                        
                        <div>
                          <Label>Total (Le)</Label>
                          <Input value={item.total_price.toFixed(2)} disabled className="h-12 text-base" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sale Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Sale Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Le {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="discount">Discount:</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 h-8 text-right"
                    min="0"
                    max={subtotal}
                    step="0.01"
                  />
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>Le {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Payment Method:</span>
                  <span className="capitalize">{saleData.payment_method.replace('_', ' ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="order-2 sm:order-1 h-12 text-base">
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave} disabled={loading || total <= 0} className="order-1 sm:order-2 h-12 text-base">
              <Save className="h-4 w-4" />
              {loading ? "Recording..." : "Record Sale"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}