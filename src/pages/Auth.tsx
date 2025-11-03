import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, ArrowLeft, Building } from 'lucide-react'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('signin')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  
  const { signIn, signUp, user, resetPassword, updatePassword } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Check for invite mode, reset password mode, and redirect authenticated users
  useEffect(() => {
    const mode = searchParams.get('mode')
    const type = searchParams.get('type')
    
    if (mode === 'reset') {
      setActiveTab('reset')
    }
    
    // If user just accepted an invite, show password setup
    if (user && type === 'invite') {
      setShowPasswordSetup(true)
      return
    }
    
    if (user && !showPasswordSetup) {
      navigate('/')
    }
  }, [user, navigate, searchParams, showPasswordSetup])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please check your credentials and try again.",
            variant: "destructive"
          })
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Sign in failed",
            description: error.message || "An unexpected error occurred",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        })
        navigate('/')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signUp(email, password)
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive"
          })
          setActiveTab('signin')
        } else if (error.message.includes('Password should be at least')) {
          toast({
            title: "Weak password",
            description: "Please choose a stronger password (at least 6 characters).",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Sign up failed",
            description: error.message || "An unexpected error occurred",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email for a confirmation link."
        })
        setActiveTab('signin')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        toast({
          title: "Reset failed",
          description: error.message || "Failed to send reset email",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Reset email sent",
          description: "Please check your email for password reset instructions."
        })
        setShowForgotPassword(false)
        setActiveTab('signin')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmNewPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await updatePassword(newPassword)
      
      if (error) {
        toast({
          title: "Password setup failed",
          description: error.message || "Failed to set password",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Password set successfully!",
          description: "You can now proceed to complete your profile."
        })
        setShowPasswordSetup(false)
        navigate('/onboarding')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
      <div className="absolute top-1/4 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 mb-6 hover-lift"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
              <Building className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MiBuks
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Professional business management for Sierra Leone
          </p>
        </div>

        {/* Auth Tabs */}
        <Card className="professional-card animate-scale-in border-0 shadow-elegant">
          {showPasswordSetup ? (
            // Password Setup for Invited Users
            <>
              <CardHeader className="pb-6 pt-8">
                <div className="space-y-3 text-center">
                  <CardTitle className="text-xl sm:text-2xl text-foreground">Set Your Password</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Welcome! Please create a password for your account
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-8 pb-8">
                <form onSubmit={handlePasswordSetup} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="new-password" className="text-sm font-medium text-foreground">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password (min. 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        required
                        minLength={6}
                        className="h-12 pr-12 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-muted transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirm-new-password" className="text-sm font-medium text-foreground">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="h-12 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Setting password...
                      </div>
                    ) : (
                      "Set Password & Continue"
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : showForgotPassword ? (
            // Forgot Password Form
            <CardHeader className="pb-6 pt-8">
              <div className="space-y-3 text-center">
                <CardTitle className="text-2xl text-foreground">Reset Password</CardTitle>
                <CardDescription className="text-base">
                  Enter your email address and we'll send you a reset link
                </CardDescription>
              </div>
            </CardHeader>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-6 pt-8">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-xl">
                  <TabsTrigger 
                    value="signin" 
                    className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="space-y-6 px-8 pb-8">
                <TabsContent value="signin" className="space-y-6 mt-0">
                  <div className="space-y-3 text-center">
                    <CardTitle className="text-2xl text-foreground">Welcome back</CardTitle>
                    <CardDescription className="text-base">
                      Sign in to continue managing your business
                    </CardDescription>
                  </div>
                  
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-3">
                      <Label htmlFor="signin-email" className="text-sm font-medium text-foreground">
                        Email Address
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="h-12 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password" className="text-sm font-medium text-foreground">
                          Password
                        </Label>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-primary hover:text-primary-hover text-sm"
                          onClick={() => setShowForgotPassword(true)}
                          disabled={loading}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          required
                          className="h-12 pr-12 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-10 w-10 hover:bg-muted transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Signing in...
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

              <TabsContent value="signup" className="space-y-6 mt-0">
                <div className="space-y-3 text-center">
                  <CardTitle className="text-2xl text-foreground">Create your account</CardTitle>
                  <CardDescription className="text-base">
                    Join thousands of businesses in Sierra Leone
                  </CardDescription>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                      className="h-12 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose a strong password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        minLength={6}
                        className="h-12 pr-12 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-muted transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="h-12 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword && (
            <CardContent className="space-y-6 px-8 pb-8">
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="reset-email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="h-12 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending reset email...
                      </div>
                    ) : (
                      "Send Reset Email"
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setEmail('')
                    }}
                    disabled={loading}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            By signing up, you agree to our{' '}
            <span className="text-primary hover:text-primary-hover cursor-pointer transition-colors">
              terms of service
            </span>{' '}
            and{' '}
            <span className="text-primary hover:text-primary-hover cursor-pointer transition-colors">
              privacy policy
            </span>.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-prosperity-green rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Trusted by 1000+ businesses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}