import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useCreditScore } from '@/hooks/useCreditScore'
import { useLoans } from '@/hooks/useLoans'
import { LoanApplicationModal } from '@/components/LoanApplicationModal'
import { ViewLoanApplicationModal } from '@/components/ViewLoanApplicationModal'
import { formatCurrency } from '@/lib/utils'
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Plus,
  Shield,
  Info,
  AlertCircle,
  Eye
} from 'lucide-react'

export default function Credit() {
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const creditScoreData = useCreditScore()
  const { loanApplications, loading } = useLoans()

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application)
    setShowDetailsModal(true)
  }

  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'disbursed': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Credit & Financing</h1>
          <p className="text-muted-foreground">
            Manage your business credit profile and loan applications
          </p>
        </div>
        <Button onClick={() => setShowLoanModal(true)} className="flex items-center gap-2 w-full sm:w-auto" variant="default">
          <Plus className="h-4 w-4" />
          Apply for Loan
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Loan Applications</TabsTrigger>
          <TabsTrigger value="score">Credit Score</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Credit Score Overview */}
          <Card className="professional-card bg-gradient-primary text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5" />
                Your Business Credit Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold">{creditScoreData.score}</div>
                  <p className="text-white/80">{creditScoreData.rating} Credit</p>
                </div>
                <div className="text-right">
                  <div className="text-green-300 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Live calculation
                  </div>
                  <p className="text-white/80 text-sm">Sierra Leone Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="professional-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loanApplications.filter(app => app.status === 'disbursed').length}
                </div>
              </CardContent>
            </Card>

            <Card className="professional-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loanApplications.filter(app => app.status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card className="professional-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    loanApplications
                      .filter(app => app.approved_amount)
                      .reduce((sum, app) => sum + (app.approved_amount || 0), 0)
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Loan Products */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>Available Loan Products</CardTitle>
              <CardDescription>Loan facilities available for your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-primary text-base">Inventory Financing - Basic</h3>
                      <Badge variant="secondary" className="self-start sm:self-auto">Active</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Amount Range:</span>
                        <span className="font-medium text-right">SLL 10,000 - 350,000</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Interest Rate:</span>
                        <span className="font-medium">12% annually</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Term:</span>
                        <span className="font-medium">6 months</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Min Credit Score:</span>
                        <span className="font-medium">500</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-primary text-base">Inventory Financing - Premium</h3>
                      <Badge variant="secondary" className="self-start sm:self-auto">Active</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Amount Range:</span>
                        <span className="font-medium text-right">SLL 100,000 - 1,000,000</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Interest Rate:</span>
                        <span className="font-medium">10% annually</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Term:</span>
                        <span className="font-medium">12 months</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Min Credit Score:</span>
                        <span className="font-medium">650</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-primary text-base">Working Capital</h3>
                      <Badge variant="secondary" className="self-start sm:self-auto">Active</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Amount Range:</span>
                        <span className="font-medium text-right">SLL 50,000 - 2,000,000</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Interest Rate:</span>
                        <span className="font-medium">15% annually</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Term:</span>
                        <span className="font-medium">18 months</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Min Credit Score:</span>
                        <span className="font-medium">600</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Financing Partners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-prosperity-green" />
                  Kenema Cooperative Credit Unions
                </CardTitle>
                <p className="text-sm text-muted-foreground">Leading cooperative financial institution</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Comprehensive financing solutions for provision shops and small businesses
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Available Credit:</span>
                    <span className="font-semibold">Le 200,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-semibold text-prosperity-green">6% APR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Time:</span>
                    <span className="font-semibold">72 hours</span>
                  </div>
                </div>
                <Button variant="success" className="w-full mt-4">
                  Apply Now
                </Button>
              </CardContent>
            </Card>

            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-prosperity-green" />
                  MiBuks Finance
                </CardTitle>
                <p className="text-sm text-muted-foreground">Provided by Millennial Sierra Leone</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Ultra-low rate financing for provision shop inventory and growth
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Available Credit:</span>
                    <span className="font-semibold">Le 150,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-semibold text-prosperity-green">5% APR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Time:</span>
                    <span className="font-semibold">2 hours</span>
                  </div>
                </div>
                <Button variant="success" className="w-full mt-4">
                  Apply Now
                </Button>
              </CardContent>
            </Card>

            <Card className="professional-card opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-fintech-blue" />
                    Ecobank
                  </div>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Coming Soon</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Traditional banking with competitive rates for small businesses
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Available Credit:</span>
                    <span className="font-semibold">Le 100,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-semibold text-prosperity-green">8% APR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Time:</span>
                    <span className="font-semibold">48 hours</span>
                  </div>
                </div>
                <Button variant="professional" className="w-full mt-4" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="professional-card opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-warning" />
                    Orange Money
                  </div>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Coming Soon</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Mobile money-based micro-lending for quick cash flow needs
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Available Credit:</span>
                    <span className="font-semibold">Le 75,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-semibold text-prosperity-green">7% APR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Time:</span>
                    <span className="font-semibold">30 minutes</span>
                  </div>
                </div>
                <Button variant="warning" className="w-full mt-4" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>Recent Loan Applications</CardTitle>
              <CardDescription>Your latest loan application activity</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading applications...</div>
              ) : loanApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No loan applications yet</p>
                  <p className="text-sm">Click "Apply for Loan" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {loanApplications.slice(0, 5).map((application) => (
                    <div key={application.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(application.status)}
                        <div>
                          <p className="font-medium">{application.application_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {application.loan_product?.name || 'Loan Application'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-left sm:text-right">
                          <div className="font-medium">{formatCurrency(application.requested_amount)}</div>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle>All Loan Applications</CardTitle>
              <CardDescription>Complete history of your loan applications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading applications...</div>
              ) : loanApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No loan applications yet</p>
                  <Button onClick={() => setShowLoanModal(true)} className="mt-4" variant="default">
                    Apply for Your First Loan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {loanApplications.map((application) => (
                    <Card key={application.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                          <div>
                            <h3 className="font-semibold">{application.application_number}</h3>
                            <p className="text-sm text-muted-foreground">
                              {application.loan_product?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(application)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Details
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Requested Amount</p>
                            <p>{formatCurrency(application.requested_amount)}</p>
                          </div>
                          {application.approved_amount && (
                            <div>
                              <p className="font-medium">Approved Amount</p>
                              <p>{formatCurrency(application.approved_amount)}</p>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">Application Date</p>
                            <p>{new Date(application.created_at).toLocaleDateString()}</p>
                          </div>
                          {application.supplier && (
                            <div>
                              <p className="font-medium">Supplier</p>
                              <p>{application.supplier.name}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="score" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-fintech-blue" />
                Credit Score Breakdown
              </CardTitle>
              <CardDescription>
                Your credit score of {creditScoreData.score} is rated as {creditScoreData.rating}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(creditScoreData.factors).map(([key, factor]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()} ({factor.weight}%)
                    </span>
                    <Badge variant={factor.score >= 650 ? "default" : factor.score >= 550 ? "secondary" : "destructive"}>
                      {factor.score}
                    </Badge>
                  </div>
                  <Progress value={(factor.score / 850) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {creditScoreData.improvements.length > 0 && (
            <Card className="professional-card border-warning/20 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertCircle className="h-5 w-5" />
                  Improvement Suggestions
                </CardTitle>
                <CardDescription>Actions you can take to improve your credit score</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {creditScoreData.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <LoanApplicationModal
        open={showLoanModal}
        onOpenChange={setShowLoanModal}
        onClose={() => setShowLoanModal(false)}
      />

      <ViewLoanApplicationModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        application={selectedApplication}
      />
    </div>
  )
}