import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Building2 } from 'lucide-react'

interface BusinessDetailsFormProps {
  onComplete: (data: {
    businessName: string
    businessType: string
    address: string
    phone: string
    email: string
    currency: string
  }) => void
  loading?: boolean
}

export function BusinessDetailsForm({ onComplete, loading = false }: BusinessDetailsFormProps) {
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState('SLL')
  const { toast } = useToast()

  const businessTypes = [
    'provision_store',
    'retail',
    'wholesale',
    'restaurant',
    'pharmacy',
    'supermarket',
    'electronics',
    'clothing',
    'other'
  ]

  const currencies = [
    { value: 'SLL', label: 'Sierra Leonean Leone (SLL)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!businessName.trim() || !businessType) {
      toast({
        title: "Missing information",
        description: "Please enter your business name and type",
        variant: "destructive"
      })
      return
    }

    onComplete({
      businessName: businessName.trim(),
      businessType,
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      currency
    })
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Business Information</CardTitle>
        <CardDescription>
          Tell us about your business to personalize your experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="Enter your business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Select value={businessType} onValueChange={setBusinessType} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              placeholder="Enter your business address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input
                id="businessPhone"
                type="tel"
                placeholder="Business phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input
                id="businessEmail"
                type="email"
                placeholder="Business email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}