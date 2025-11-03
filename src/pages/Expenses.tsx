import { useState } from 'react'
import { Plus, Search, Filter, Eye, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useExpenses } from '@/hooks/useExpenses'
import { useLanguage } from '@/contexts/LanguageContext'
import { AddExpenseModal } from '@/components/AddExpenseModal'
import { EditExpenseModal } from '@/components/EditExpenseModal'
import { ViewExpenseModal } from '@/components/ViewExpenseModal'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)

  const { expenses, loading, deleteExpense } = useExpenses()
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'cash') return matchesSearch && expense.payment_method === 'cash'
    if (selectedFilter === 'bank') return matchesSearch && expense.payment_method === 'bank_transfer'
    if (selectedFilter === 'mobile') return matchesSearch && expense.payment_method === 'mobile_money'

    return matchesSearch
  })

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expenseId)
        toast.success('Expense deleted successfully')
      } catch (error) {
        toast.error('Failed to delete expense')
      }
    }
  }

  const handleViewExpense = (expense: any) => {
    setSelectedExpense(expense)
    setIsViewModalOpen(true)
  }

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense)
    setIsEditModalOpen(true)
  }

  const totalExpenses = expenses.length
  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expense_date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  })
  const thisMonthAmount = thisMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  const filterOptions = [
    { value: 'all', label: 'All Expenses' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'mobile', label: 'Mobile Money' }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Manage your business expenses</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SLL {totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SLL {thisMonthAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{thisMonthExpenses.length} expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No expenses found</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        {expense.category && (
                          <Badge variant="outline">{expense.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{expense.supplier?.name || '-'}</TableCell>
                      <TableCell className="font-mono">
                        SLL {Number(expense.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {expense.payment_method?.replace('_', ' ') || 'cash'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewExpense(expense)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddExpenseModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {selectedExpense && (
        <>
          <EditExpenseModal
            expense={selectedExpense}
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedExpense(null)
            }}
          />

          <ViewExpenseModal
            expense={selectedExpense}
            open={isViewModalOpen}
            onOpenChange={setIsViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false)
              setSelectedExpense(null)
            }}
          />
        </>
      )}
    </div>
  )
}