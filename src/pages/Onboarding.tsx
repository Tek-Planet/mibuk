import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserDetailsForm } from '@/components/onboarding/UserDetailsForm'
import { BusinessDetailsForm } from '@/components/onboarding/BusinessDetailsForm'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle } from 'lucide-react'

type OnboardingStep = 'user-details' | 'business-details' | 'complete'

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('user-details')
  const [loading, setLoading] = useState(false)
  const [isInvitedMember, setIsInvitedMember] = useState(false)
  const [userDetails, setUserDetails] = useState<{
    firstName: string
    lastName: string
    phone: string
  } | null>(null)
  
  const { user } = useAuth()
  const { refetch } = useUserProfile()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Check if user is an invited member (not a business owner)
  useEffect(() => {
    const checkMembershipStatus = async () => {
      if (!user) return

      const { data: memberData } = await supabase
        .from('organization_members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (memberData) {
        setIsInvitedMember(true)
      }
    }

    checkMembershipStatus()
  }, [user])

  const steps = [
    { id: 'user-details', title: 'Personal Info', description: 'Your personal details' },
    { id: 'business-details', title: 'Business Info', description: 'Your business details' },
    { id: 'complete', title: 'Complete', description: 'Setup complete' }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleUserDetailsComplete = async (data: { firstName: string; lastName: string; phone: string }) => {
    setUserDetails(data)
    
    // If invited member, skip business details and save profile directly
    if (isInvitedMember) {
      if (!user) return
      
      setLoading(true)
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone
          }, {
            onConflict: 'user_id'
          })

        if (profileError) throw profileError

        // Refetch user profile
        await refetch()
        
        toast({
          title: "Profile complete!",
          description: "Welcome to your team's workspace."
        })

        window.dispatchEvent(new Event('user-data-updated'))
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 300)
      } catch (error: any) {
        toast({
          title: "Setup failed",
          description: error.message || "Failed to save your information. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    } else {
      setCurrentStep('business-details')
    }
  }

  const handleBusinessDetailsComplete = async (businessData: {
    businessName: string
    businessType: string
    address: string
    phone: string
    email: string
    currency: string
  }) => {
    if (!user || !userDetails) return

    setLoading(true)
    
    try {
      // Save user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: userDetails.firstName,
          last_name: userDetails.lastName,
          phone: userDetails.phone
        }, {
          onConflict: 'user_id'
        })

      if (profileError) throw profileError

      // Save business details
      const { error: businessError } = await supabase
        .from('businesses')
        .upsert({
          owner_id: user.id,
          business_name: businessData.businessName,
          business_type: businessData.businessType,
          address: businessData.address,
          phone: businessData.phone,
          email: businessData.email,
          currency: businessData.currency
        }, {
          onConflict: 'owner_id'
        })

      if (businessError) throw businessError

      // Refetch user profile to update onboarding status
      const refetchResult = await refetch()
      
      if (refetchResult && !refetchResult.needsOnboarding) {
        toast({
          title: "Setup complete!",
          description: "Your account has been set up successfully."
        })

        // Invalidate profile cache across the app, then redirect
        window.dispatchEvent(new Event('user-data-updated'))
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 300)
      } else {
        throw new Error("Failed to complete onboarding setup")
      }

    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message || "Failed to save your information. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep === 'business-details') {
      setCurrentStep('user-details')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'user-details':
        return (
          <UserDetailsForm
            onComplete={handleUserDetailsComplete}
            loading={loading}
          />
        )
      case 'business-details':
        return (
          <BusinessDetailsForm
            onComplete={handleBusinessDetailsComplete}
            loading={loading}
          />
        )
      case 'complete':
        return (
          <div className="text-center space-y-6 max-w-lg mx-auto">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-16 w-16 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Setup Complete!</h2>
              <p className="text-muted-foreground">
                Welcome to MiBuks! Your account is now ready. You'll be redirected to your dashboard shortly.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Account Setup</h1>
            {currentStep === 'business-details' && (
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">Back</span>
              </Button>
            )}
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-1.5 sm:h-2" />
          </div>

          {/* Steps */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center text-xs sm:text-sm font-semibold ${
                  index < currentStepIndex ? 'bg-primary text-primary-foreground' :
                  index === currentStepIndex ? 'bg-primary/20 text-primary border-2 border-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <div className="text-[10px] sm:text-xs font-medium hidden sm:block">{step.title}</div>
                <div className="text-[10px] font-medium sm:hidden">{step.title.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}