import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus } from 'lucide-react'
import { useInventory, type InventoryFormData } from '@/hooks/useInventory'

interface AddInventoryModalProps {
  children?: React.ReactNode
  onItemAdded?: () => void
}

const categories = [
  'Staples',
  'Cooking',
  'Seasoning',
  'Sweet',
  'Beverages',
  'Dairy',
  'Meat & Fish',
  'Vegetables',
  'Fruits',
  'Snacks',
  'Personal Care',
  'Household',
  'Other'
]

export function AddInventoryModal({ children, onItemAdded }: AddInventoryModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addInventoryItem } = useInventory()

  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    category: '',
    sku: '',
    barcode: '',
    description: '',
    unit_price: 0,
    cost_price: 0,
    stock_quantity: 0,
    min_stock_level: 0,
    supplier: '',
    location: '',
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addInventoryItem(formData)
      setFormData({
        name: '',
        category: '',
        sku: '',
        barcode: '',
        description: '',
        unit_price: 0,
        cost_price: 0,
        stock_quantity: 0,
        min_stock_level: 0,
        supplier: '',
        location: '',
        is_active: true
      })
      setOpen(false)
      onItemAdded?.()
    } catch (error) {
      console.error('Error adding inventory item:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof InventoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                placeholder="Stock Keeping Unit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => updateField('barcode', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price (Le) *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => updateField('unit_price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price (Le)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={(e) => updateField('cost_price', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => updateField('stock_quantity', parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
              <Input
                id="min_stock_level"
                type="number"
                min="0"
                value={formData.min_stock_level}
                onChange={(e) => updateField('min_stock_level', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => updateField('supplier', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Shelf, Aisle, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => updateField('is_active', checked)}
            />
            <Label htmlFor="is_active">Active Product</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}