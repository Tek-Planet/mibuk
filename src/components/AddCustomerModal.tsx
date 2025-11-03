import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Users, CalendarIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CustomerData {
  name: string
  phone: string
  email: string
  address: string
  business_type: string
  credit_limit: string
  birthday?: Date
}

interface AddCustomerModalProps {
  onCustomerAdded?: () => void
}

export function AddCustomerModal({ onCustomerAdded }: AddCustomerModalProps = {}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    business_type: '',
    credit_limit: '0',
    birthday: undefined
  })

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!customer.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add customers",
          variant: "destructive"
        })
        return
      }

      // First, get or create a business for this user
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)

      let businessId: string

      if (businessError || !businesses || businesses.length === 0) {
        // Create a default business for the user
        const { data: newBusiness, error: createBusinessError } = await supabase
          .from('businesses')
          .insert({
            owner_id: user.id,
            business_name: 'My Business',
            business_type: 'retail',
            currency: 'SLL'
          })
          .select('id')
          .single()

        if (createBusinessError || !newBusiness) {
          throw new Error('Failed to create business')
        }
        businessId = newBusiness.id
      } else {
        businessId = businesses[0].id
      }

      const { error } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          business_id: businessId,
          name: customer.name,
          phone: customer.phone || null,
          email: customer.email || null,
          address: customer.address || null,
          business_type: customer.business_type || null,
          credit_limit: parseFloat(customer.credit_limit) || 0,
          birthday: customer.birthday ? format(customer.birthday, 'yyyy-MM-dd') : null
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Customer added successfully"
      })

      // Reset form and close modal
      setCustomer({
        name: '',
        phone: '',
        email: '',
        address: '',
        business_type: '',
        credit_limit: '0',
        birthday: undefined
      })
      setOpen(false)
      
      // Trigger refetch in parent component
      onCustomerAdded?.();
    } catch (error) {
      console.error('Error adding customer:', error)
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = customer.name.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-24 flex flex-col gap-3 hover-lift border-2 hover:border-primary/50 transition-all duration-300">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <span className="font-semibold">Add Customer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add New Customer
          </DialogTitle>
          <DialogDescription>
            Add a new customer to your business records
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
                  value={customer.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={customer.phone}
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
                value={customer.email}
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
                      !customer.birthday && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customer.birthday ? format(customer.birthday, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customer.birthday}
                    onSelect={(date) => setCustomer(prev => ({ ...prev, birthday: date }))}
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
                value={customer.address}
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
                <Select value={customer.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
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
                  value={customer.credit_limit}
                  onChange={(e) => handleInputChange('credit_limit', e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="order-2 sm:order-1 h-12 text-base">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || loading}
            className="order-1 sm:order-2 min-w-[100px] h-12 text-base"
          >
            {loading ? "Adding..." : "Add Customer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}