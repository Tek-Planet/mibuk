import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit } from 'lucide-react'
import { Sale, useSales } from '@/hooks/useSales'
import { supabase } from '@/integrations/supabase/client'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

interface EditSaleModalProps {
  sale: Sale
}

export function EditSaleModal({ sale }: EditSaleModalProps) {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const { updateSale } = useSales()
  
  const [formData, setFormData] = useState({
    customer_id: sale.customer_id || 'none',
    total_amount: sale.total_amount.toString(),
    payment_method: sale.payment_method,
    notes: sale.notes || '',
    sale_date: sale.sale_date
  })

  useEffect(() => {
    if (open) {
      fetchCustomers()
    }
  }, [open])

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('id, name, email, phone')
      .order('name')
    
    setCustomers(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await updateSale(sale.id, {
        customer_id: formData.customer_id === 'none' ? null : formData.customer_id,
        total_amount: parseFloat(formData.total_amount),
        payment_method: formData.payment_method as any,
        notes: formData.notes,
        sale_date: formData.sale_date
      })
      
      setOpen(false)
    } catch (error) {
      console.error('Error updating sale:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select 
              value={formData.customer_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Walk-in Customer</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Total Amount (Le)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.total_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select 
              value={formData.payment_method} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value as 'cash' | 'mobile_money' | 'bank_transfer' | 'credit' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale_date">Sale Date</Label>
            <Input
              id="sale_date"
              type="date"
              value={formData.sale_date}
              onChange={(e) => setFormData(prev => ({ ...prev, sale_date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes about this sale..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Update Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}