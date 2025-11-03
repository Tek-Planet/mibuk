import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Settings, User, Bell, Shield, Database, Palette, Globe, Camera, Key, Download, Upload, Trash2, Save, Edit, Eye, EyeOff, Users } from 'lucide-react'
import { DocumentUpload } from '@/components/DocumentUpload'
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload'
import { TeamManagement } from '@/components/TeamManagement'
import { useState, useEffect } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useBusinessInfo } from '@/hooks/useBusinessInfo'
import { useAuth } from '@/contexts/AuthContext'
import { usePageAccess } from '@/hooks/usePageAccess'
import { useLanguage, type Language } from '@/contexts/LanguageContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

const SettingsPage = () => {
  const { user, signOut } = useAuth()
  const { profile, business, loading } = useUserProfile()
  const { isOwner } = usePageAccess()
  const { language: contextLanguage, setLanguage: setContextLanguage } = useLanguage()
  const { theme: currentTheme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [profilePhotoFilePath, setProfilePhotoFilePath] = useState<string | null>(null)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  })

  // Business form state
  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    business_type: '',
    address: '',
    phone: '',
    email: '',
    currency: 'SLL',
    tax_rate: 0
  })

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    lowStock: true,
    newOrders: true,
    payments: true,
    weeklyReports: false,
    monthlyReports: true
  })

  // App preferences
  const [preferences, setPreferences] = useState<{
    theme: string
    language: Language
    dateFormat: string
    timeFormat: string
    currency: string
    autoBackup: boolean
    compactView: boolean
  }>({
    theme: currentTheme || 'system',
    language: contextLanguage,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'SLL',
    autoBackup: true,
    compactView: false
  })

  // Sync language and theme preference with context
  useEffect(() => {
    setPreferences(prev => ({ 
      ...prev, 
      language: contextLanguage,
      theme: currentTheme || 'system'
    }))
  }, [contextLanguage, currentTheme])

  // Load data when component mounts
  useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      })
    }
  }, [profile])

  // Load profile photo
  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('profile_documents')
          .select('file_path')
          .eq('user_id', user.id)
          .eq('document_type', 'profile_photo')
          .maybeSingle()

        if (error) throw error

        if (data?.file_path) {
          setProfilePhotoFilePath(data.file_path)
          const { data: signed, error: signedError } = await supabase.storage
            .from('profile-documents')
            .createSignedUrl(data.file_path, 3600)
          if (!signedError) {
            setProfilePhotoUrl(signed?.signedUrl || null)
          }
        }
      } catch (error) {
        console.error('Error loading profile photo:', error)
      }
    }

    loadProfilePhoto()
  }, [user])

  useEffect(() => {
    if (business) {
      setBusinessForm({
        business_name: business.business_name || '',
        business_type: business.business_type || '',
        address: business.address || '',
        phone: business.phone || '',
        email: business.email || '',
        currency: business.currency || 'SLL',
        tax_rate: Number((business as any).tax_rate) || 0
      })
    }
  }, [business])

  // Save profile function
  const handleSaveProfile = async () => {
    if (!profile) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileForm)
        .eq('user_id', user?.id)

      if (error) throw error
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  // Save business function
  const handleSaveBusiness = async () => {
    setIsSaving(true)
    try {
      if (business) {
        const { error } = await supabase
          .from('businesses')
          .update(businessForm)
          .eq('id', business.id)

        if (error) throw error
      } else {
        // Create new business if none exists
        const { error } = await supabase
          .from('businesses')
          .insert([{
            ...businessForm,
            owner_id: user?.id
          }])

        if (error) throw error
      }

      toast.success('Business information updated successfully')
    } catch (error) {
      toast.error('Failed to update business information')
    } finally {
      setIsSaving(false)
    }
  }

  // Change password function
  const handleChangePassword = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (securityForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: securityForm.newPassword
      })

      if (error) throw error

      toast.success('Password updated successfully')
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error('Failed to update password')
    } finally {
      setIsSaving(false)
    }
  }

  // Export data function
  const handleExportData = async () => {
    try {
      // This would typically call an API endpoint to generate and download data
      toast.success('Data export will be sent to your email')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  // Delete account function
  const handleDeleteAccount = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      // Call the delete-user edge function to delete the user from auth.users
      // This will cascade and automatically delete all related data
      const { data, error } = await supabase.functions.invoke('delete-user')

      if (error) {
        console.error('Error deleting account:', error)
        toast.error('Failed to delete account. Please try again.')
        return
      }

      // Sign out the user
      await signOut()
      
      toast.success('Account deleted successfully')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className={`inline-grid ${isOwner ? 'grid-cols-7' : 'grid-cols-6'} min-w-full sm:min-w-0`}>
            <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Prof</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Business</span>
              <span className="sm:hidden">Biz</span>
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="team" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                Team
              </TabsTrigger>
            )}
            <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden">Sec</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Preferences</span>
              <span className="sm:hidden">Pref</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Database className="h-3 w-3 sm:h-4 sm:w-4" />
              Data
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <ProfilePhotoUpload
                  currentPhotoUrl={profilePhotoUrl}
                  currentFilePath={profilePhotoFilePath}
                  userInitials={getUserInitials()}
                  onPhotoUpdate={setProfilePhotoUrl}
                />

                <Separator />

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact support to change your email address
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Documents Upload */}
            <DocumentUpload
              type="profile"
              title="Identity Verification"
              description="Upload identity documents to verify your profile and improve your credit score."
              documentTypes={[
                { value: 'selfie', label: 'Profile Selfie' },
                { value: 'national_id', label: 'National ID Card' },
                { value: 'passport', label: 'Passport' },
                { value: 'drivers_license', label: "Driver's License" },
                { value: 'voter_id', label: 'Voter ID Card' },
                { value: 'other_id', label: 'Other ID Document' }
              ]}
              maxFiles={5}
            />
          </div>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business">
          <div className="space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={businessForm.business_name}
                      onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={businessForm.business_type}
                      onValueChange={(value) => setBusinessForm({ ...businessForm, business_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supermarket">Supermarket</SelectItem>
                        <SelectItem value="convenience_store">Convenience Store</SelectItem>
                        <SelectItem value="grocery_store">Grocery Store</SelectItem>
                        <SelectItem value="provision_shop">Provision Shop</SelectItem>
                        <SelectItem value="mini_mart">Mini Mart</SelectItem>
                        <SelectItem value="retail">General Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={businessForm.address}
                    onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                    placeholder="Enter complete business address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      value={businessForm.phone}
                      onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                      placeholder="Enter business phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={businessForm.email}
                      onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                      placeholder="Enter business email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select
                      value={businessForm.currency}
                      onValueChange={(value) => setBusinessForm({ ...businessForm, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SLL">Sierra Leone Leone (Le)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={businessForm.tax_rate}
                      onChange={(e) => setBusinessForm({ ...businessForm, tax_rate: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveBusiness} 
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Business Documents Upload */}
            <DocumentUpload
              type="business"
              title="Business Documents"
              description="Upload official business documents to improve your credit score and verify your business legitimacy."
              documentTypes={[
                { value: 'certificate_of_registration', label: 'Certificate of Registration' },
                { value: 'certificate_of_incorporation', label: 'Certificate of Incorporation' },
                { value: 'city_registration', label: 'City Registration Document' },
                { value: 'nra_tax_registration', label: 'NRA Tax Registration' },
                { value: 'nra_tax_clearance', label: 'NRA Tax Clearance' },
                { value: 'business_license', label: 'Business License' },
                { value: 'other', label: 'Other Business Document' }
              ]}
              maxFiles={10}
            />

            {/* Business Location Photo */}
            <DocumentUpload
              type="business"
              title="Business Location Photo"
              description="Upload photos of your business location to verify your physical presence and improve credibility."
              documentTypes={[
                { value: 'storefront_photo', label: 'Storefront Photo' },
                { value: 'interior_photo', label: 'Interior Photo' },
                { value: 'signage_photo', label: 'Business Signage' },
                { value: 'location_photo', label: 'Location Photo' }
              ]}
              maxFiles={5}
            />
          </div>
        </TabsContent>

        {/* Team Tab */}
        {isOwner && (
          <TabsContent value="team">
            <TeamManagement />
          </TabsContent>
        )}

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button 
                  onClick={handleChangePassword} 
                  disabled={isSaving || !securityForm.newPassword}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>

            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login History</Label>
                    <p className="text-sm text-muted-foreground">View recent login activity</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low-stock">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when inventory is low</p>
                  </div>
                  <Switch
                    id="low-stock"
                    checked={notifications.lowStock}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-orders">New Order Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new customer orders</p>
                  </div>
                  <Switch
                    id="new-orders"
                    checked={notifications.newOrders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newOrders: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payments">Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about payments and transactions</p>
                  </div>
                  <Switch
                    id="payments"
                    checked={notifications.payments}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, payments: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly business summaries</p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monthly-reports">Monthly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive monthly business analytics</p>
                  </div>
                  <Switch
                    id="monthly-reports"
                    checked={notifications.monthlyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, monthlyReports: checked })}
                  />
                </div>
              </div>

              <Button className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                App Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => {
                      setPreferences({ ...preferences, theme: value })
                      setTheme(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => {
                      const lang = value as Language
                      setPreferences({ ...preferences, language: lang })
                      setContextLanguage(lang)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="krio">Krio</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select
                    value={preferences.timeFormat}
                    onValueChange={(value) => setPreferences({ ...preferences, timeFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup">Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup your data daily</p>
                  </div>
                  <Switch
                    id="auto-backup"
                    checked={preferences.autoBackup}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, autoBackup: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-view">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact layout for data tables</p>
                  </div>
                  <Switch
                    id="compact-view"
                    checked={preferences.compactView}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, compactView: checked })}
                  />
                </div>
              </div>

              <Button className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <div className="space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Export Data</Label>
                    <p className="text-sm text-muted-foreground">Download all your business data</p>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Last backup: {preferences.autoBackup ? 'Today at 2:30 AM' : 'Manual backup required'}
                    </p>
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="professional-card border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Delete Account</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data. This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" disabled={isSaving}>
                         <Trash2 className="h-4 w-4 mr-2" />
                         {isSaving ? 'Deleting...' : 'Delete Account'}
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;