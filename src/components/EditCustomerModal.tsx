import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Edit, CalendarIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  business_type?: string
  credit_limit: number
  current_balance: number
  birthday?: string
}

interface EditCustomerModalProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerUpdated: () => void
}

export function EditCustomerModal({ customer, open, onOpenChange, onCustomerUpdated }: EditCustomerModalProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: customer.name,
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
    business_type: customer.business_type || '',
    credit_limit: customer.credit_limit.toString(),
    birthday: customer.birthday ? new Date(customer.birthday) : undefined
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          business_type: formData.business_type || null,
          credit_limit: parseFloat(formData.credit_limit) || 0,
          birthday: formData.birthday ? format(formData.birthday, 'yyyy-MM-dd') : null
        })
        .eq('id', customer.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Customer updated successfully"
      })

      onCustomerUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating customer:', error)
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.name.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Customer
          </DialogTitle>
          <DialogDescription>
            Update customer information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 sm:gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="h-12 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !formData.birthday && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birthday ? format(formData.birthday, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.birthday}
                    onSelect={(date) => setFormData(prev => ({ ...prev, birthday: date }))}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter customer address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="min-h-[100px] text-base"
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Business Details</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type</Label>
                <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail_store">Retail Store</SelectItem>
                    <SelectItem value="provision_shop">Provision Shop</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="market_vendor">Market Vendor</SelectItem>
                    <SelectItem value="supermarket">Supermarket</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Credit Limit (Le)</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.credit_limit}
                  onChange={(e) => handleInputChange('credit_limit', e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="order-2 sm:order-1 h-12 text-base">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || loading}
            className="order-1 sm:order-2 min-w-[100px] h-12 text-base"
          >
            {loading ? "Updating..." : "Update Customer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}