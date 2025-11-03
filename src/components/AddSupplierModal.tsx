import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Plus, Save, Truck } from 'lucide-react'
import { useState } from 'react'
import { useSuppliers } from '@/hooks/useSuppliers'

export function AddSupplierModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [supplierData, setSupplierData] = useState({
    name: '',
    phone: '',
    location: '',
    product_category: '',
    notes: ''
  })

  const { createSupplier } = useSuppliers()

  const handleSave = async () => {
    if (!supplierData.name.trim()) return

    setLoading(true)
    try {
      await createSupplier({
        name: supplierData.name,
        phone: supplierData.phone || undefined,
        location: supplierData.location || undefined,
        product_category: supplierData.product_category || undefined,
        notes: supplierData.notes || undefined
      })

      // Reset form
      setSupplierData({
        name: '',
        phone: '',
        location: '',
        product_category: '',
        notes: ''
      })
      setOpen(false)
    } catch (error) {
      console.error('Error creating supplier:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Add New Supplier
          </DialogTitle>
          <DialogDescription>
            Add a new supplier to manage purchases and expenses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Supplier Name *</Label>
            <Input
              id="name"
              value={supplierData.name}
              onChange={(e) => setSupplierData({ ...supplierData, name: e.target.value })}
              placeholder="Enter supplier name"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={supplierData.phone}
              onChange={(e) => setSupplierData({ ...supplierData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={supplierData.location}
              onChange={(e) => setSupplierData({ ...supplierData, location: e.target.value })}
              placeholder="Village/Town/City"
            />
          </div>

          <div>
            <Label htmlFor="category">Product Category</Label>
            <Select value={supplierData.product_category} onValueChange={(value) => setSupplierData({ ...supplierData, product_category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food_beverages">Food & Beverages</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing & Textiles</SelectItem>
                <SelectItem value="household">Household Items</SelectItem>
                <SelectItem value="beauty_personal">Beauty & Personal Care</SelectItem>
                <SelectItem value="stationery">Stationery & Office</SelectItem>
                <SelectItem value="hardware">Hardware & Tools</SelectItem>
                <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={supplierData.notes}
              onChange={(e) => setSupplierData({ ...supplierData, notes: e.target.value })}
              placeholder="Additional notes about this supplier"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || !supplierData.name.trim()}
              className="flex-1"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Supplier"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}