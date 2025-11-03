import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Plus, Minus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RestockItem {
  product: string
  category: string
  quantity: number
  unitCost: number
  supplier: string
  total: number
}

const products = [
  'Rice (50kg bag)', 'Palm Oil (20L)', 'Maggi Cubes', 'Milk Powder', 'Sugar (50kg)',
  'Flour (25kg)', 'Groundnut Oil', 'Biscuits', 'Soap', 'Detergent'
]

const categories = [
  'Food Items', 'Beverages', 'Personal Care', 'Household', 'Spices'
]

const suppliers = [
  'Sierra Leone Trading Co.', 'West Africa Imports', 'Local Farmers Market', 
  'Continental Distributors', 'Atlantic Suppliers'
]

export function RestockItemModal() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<RestockItem[]>([
    { product: '', category: '', quantity: 1, unitCost: 0, supplier: '', total: 0 }
  ])
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  const addItem = () => {
    setItems([...items, { product: '', category: '', quantity: 1, unitCost: 0, supplier: '', total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof RestockItem, value: string | number) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitCost') {
          updated.total = updated.quantity * updated.unitCost
        }
        return updated
      }
      return item
    })
    setItems(updatedItems)
  }

  const totalCost = items.reduce((sum, item) => sum + item.total, 0)

  const handleRestock = () => {
    console.log('Restocking items:', { items, notes, totalCost })
    toast({
      title: "Restock Order Submitted",
      description: `${items.length} items ordered for Le ${totalCost.toLocaleString()}`,
    })
    setOpen(false)
    setItems([{ product: '', category: '', quantity: 1, unitCost: 0, supplier: '', total: 0 }])
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-24 flex flex-col gap-3 hover-lift border-2 hover:border-primary/50 transition-all duration-300">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Package className="h-6 w-6 text-secondary" />
          </div>
          <span className="font-semibold">Restock Items</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Restock Inventory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Items List */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold">Items to Restock</h3>
              <Button onClick={addItem} size="sm" variant="outline" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Item {index + 1}</span>
                    {items.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Minus className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Product</Label>
                      <Select value={item.product} onValueChange={(value) => updateItem(index, 'product', value)}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product} value={product}>{product}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Category</Label>
                      <Select value={item.category} onValueChange={(value) => updateItem(index, 'category', value)}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="h-12 text-base"
                        />
                      </div>

                      <div>
                        <Label>Unit Cost (Le)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          className="h-12 text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Supplier</Label>
                      <Select value={item.supplier} onValueChange={(value) => updateItem(index, 'supplier', value)}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-semibold text-lg">Le {item.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-semibold">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span className="font-semibold">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Cost:</span>
                  <span className="font-bold text-primary">Le {totalCost.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes for this restock order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 min-h-[100px] text-base"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="order-2 sm:order-1 h-12 text-base">
              Cancel
            </Button>
            <Button 
              onClick={handleRestock} 
              className="order-1 sm:order-2 h-12 text-base"
              disabled={items.some(item => !item.product || !item.category || !item.supplier)}
            >
              Submit Restock Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}