import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Plus, Search, Edit, Trash2, Eye, DollarSign, Calendar, Users } from 'lucide-react'
import { CreateInvoiceModal } from '@/components/CreateInvoiceModal'
import { ViewInvoiceModal } from '@/components/ViewInvoiceModal'
import { EditInvoiceModal } from '@/components/EditInvoiceModal'
import { InvoiceStatusSelect } from '@/components/InvoiceStatusSelect'
import { useState } from 'react'
import { useInvoices, Invoice } from '@/hooks/useInvoices'
import { useLanguage } from '@/contexts/LanguageContext'

const Invoices = () => {
  const { t } = useLanguage()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { invoices, loading, deleteInvoice, refetch } = useInvoices()

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'overdue': return 'destructive'
      case 'sent': return 'default'
      case 'draft': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm(t('invoices.confirmDelete'))) return
    await deleteInvoice(invoiceId)
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsViewModalOpen(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsEditModalOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('invoices.title')}</h1>
            <p className="text-muted-foreground">{t('invoices.description')}</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-pulse">{t('invoices.loading')}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('invoices.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('invoices.description')}</p>
        </div>
        <Button variant="gradient" onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          {t('invoices.create')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Total Invoices</span>
            </div>
            <div className="text-2xl font-bold mt-2">{invoices.length}</div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              <span className="text-sm font-medium">Total Amount</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-success">
              Le {invoices.reduce((sum, invoice) => {
                if (invoice.status === 'cancelled') return sum;
                return sum + invoice.total_amount;
              }, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium">Outstanding</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-warning">
              Le {invoices.reduce((sum, invoice) => {
                if (invoice.status === 'cancelled') return sum;
                return sum + (invoice.total_amount - invoice.paid_amount);
              }, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-info" />
              <span className="text-sm font-medium">Paid Invoices</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-info">
              {invoices.filter(inv => inv.status === 'paid').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="professional-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices by number, customer, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle>Invoice List ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Create your first invoice to get started'}
              </p>
              {!searchQuery && (
                <Button variant="professional" onClick={() => setIsCreateModalOpen(true)}>
                  Create Your First Invoice
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Invoice #</TableHead>
                    <TableHead className="min-w-[120px]">Customer</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[100px]">Date</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[100px]">Due Date</TableHead>
                    <TableHead className="min-w-[100px]">Amount</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[100px]">Status</TableHead>
                    <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{invoice.invoice_number}</div>
                          <div className="sm:hidden text-xs text-muted-foreground mt-1">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.customer?.name || 'No Customer'}</TableCell>
                      <TableCell className="hidden sm:table-cell">{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
                      </TableCell>
                      <TableCell className="font-medium">
                        Le {invoice.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <InvoiceStatusSelect 
                          invoiceId={invoice.id}
                          currentStatus={invoice.status}
                          totalAmount={invoice.total_amount}
                          onStatusChange={refetch}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditInvoice(invoice)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-destructive hover:text-destructive"
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

      <CreateInvoiceModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onInvoiceCreated={refetch}
      />
      
      <ViewInvoiceModal 
        invoice={selectedInvoice}
        open={isViewModalOpen} 
        onOpenChange={setIsViewModalOpen} 
      />
      
      <EditInvoiceModal 
        invoice={selectedInvoice}
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
      />
    </div>
  );
};

export default Invoices;