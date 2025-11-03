import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CreditCard, FileText, Save, DollarSign } from 'lucide-react'
import { useState } from 'react'

interface CreditApplication {
  businessName: string
  ownerName: string
  phone: string
  email: string
  businessAddress: string
  yearsInBusiness: string
  monthlyRevenue: string
  requestedAmount: string
  loanPurpose: string
  repaymentPeriod: string
  collateral: string
  bankStatement: boolean
  businessLicense: boolean
  taxCertificate: boolean
}

export function ApplyCreditModal() {
  const [open, setOpen] = useState(false)
  const [application, setApplication] = useState<CreditApplication>({
    businessName: 'MiBuks Provision Store',
    ownerName: '',
    phone: '',
    email: '',
    businessAddress: '',
    yearsInBusiness: '',
    monthlyRevenue: '',
    requestedAmount: '',
    loanPurpose: '',
    repaymentPeriod: '',
    collateral: '',
    bankStatement: false,
    businessLicense: false,
    taxCertificate: false
  })

  const handleInputChange = (field: keyof CreditApplication, value: string | boolean) => {
    setApplication(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    console.log('Credit Application:', application)
    setOpen(false)
    // Here you would typically submit to your backend
  }

  const isFormValid = application.ownerName && application.phone && application.requestedAmount && application.loanPurpose

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-24 flex flex-col gap-3 hover-lift border-2 hover:border-primary/50 transition-all duration-300">
          <div className="p-2 bg-prosperity-green/10 rounded-lg">
            <CreditCard className="h-6 w-6 text-prosperity-green" />
          </div>
          <span className="font-semibold">Get Credit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Application Form
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName"
                    value={application.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="ownerName">Owner Full Name *</Label>
                  <Input 
                    id="ownerName"
                    value={application.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    placeholder="Your full name"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone"
                    value={application.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+232 XX XXX XXX"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={application.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea 
                  id="businessAddress"
                  value={application.businessAddress}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  placeholder="Full business address including district"
                  className="min-h-[100px] text-base"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="yearsInBusiness">Years in Business</Label>
                  <Select onValueChange={(value) => handleInputChange('yearsInBusiness', value)}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="more-than-10">More than 10 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="monthlyRevenue">Average Monthly Revenue (Le)</Label>
                  <Input 
                    id="monthlyRevenue"
                    type="number"
                    value={application.monthlyRevenue}
                    onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                    placeholder="25000"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="requestedAmount">Requested Amount (Le) *</Label>
                  <Input 
                    id="requestedAmount"
                    type="number"
                    value={application.requestedAmount}
                    onChange={(e) => handleInputChange('requestedAmount', e.target.value)}
                    placeholder="50000"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="repaymentPeriod">Preferred Repayment Period</Label>
                  <Select onValueChange={(value) => handleInputChange('repaymentPeriod', value)}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-months">3 months</SelectItem>
                      <SelectItem value="6-months">6 months</SelectItem>
                      <SelectItem value="12-months">12 months</SelectItem>
                      <SelectItem value="24-months">24 months</SelectItem>
                      <SelectItem value="36-months">36 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="loanPurpose">Loan Purpose *</Label>
                <Select onValueChange={(value) => handleInputChange('loanPurpose', value)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="What will you use the loan for?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory">Inventory Purchase (Rice, Oil, etc.)</SelectItem>
                    <SelectItem value="equipment">Equipment Purchase</SelectItem>
                    <SelectItem value="expansion">Business Expansion</SelectItem>
                    <SelectItem value="working-capital">Working Capital</SelectItem>
                    <SelectItem value="renovation">Shop Renovation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="collateral">Collateral (Optional)</Label>
                <Textarea 
                  id="collateral"
                  value={application.collateral}
                  onChange={(e) => handleInputChange('collateral', e.target.value)}
                  placeholder="Describe any assets you can offer as collateral (property, equipment, etc.)"
                  className="min-h-[100px] text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <p className="text-sm text-muted-foreground">Please confirm you can provide the following documents:</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="bankStatement"
                    checked={application.bankStatement}
                    onChange={(e) => handleInputChange('bankStatement', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="bankStatement">Bank Statements (Last 6 months)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="businessLicense"
                    checked={application.businessLicense}
                    onChange={(e) => handleInputChange('businessLicense', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="businessLicense">Business License/Registration</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="taxCertificate"
                    checked={application.taxCertificate}
                    onChange={(e) => handleInputChange('taxCertificate', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="taxCertificate">Tax Clearance Certificate</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Preview */}
          {application.requestedAmount && application.repaymentPeriod && (
            <Card>
              <CardHeader>
                <CardTitle>Loan Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Requested Amount:</span>
                    <span className="font-semibold">Le {parseInt(application.requestedAmount || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate (Estimated):</span>
                    <span className="font-semibold">12% - 18% APR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Repayment Period:</span>
                    <span className="font-semibold">{application.repaymentPeriod}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing Time:</span>
                    <span>3-5 business days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="order-2 sm:order-1 h-12 text-base">
              Cancel
            </Button>
            <Button variant="success" onClick={handleSubmit} disabled={!isFormValid} className="order-1 sm:order-2 h-12 text-base">
              <Save className="h-4 w-4" />
              Submit Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}