import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Calendar, DollarSign, User, CreditCard, FileText } from 'lucide-react'
import { Sale } from '@/hooks/useSales'
import { ShareButton } from '@/components/ShareButton'
import jsPDF from 'jspdf'
import { format } from 'date-fns'

interface ViewSaleModalProps {
  sale: Sale
}

export function ViewSaleModal({ sale }: ViewSaleModalProps) {
  const getPaymentMethodVariant = (method: string) => {
    switch (method) {
      case 'cash': return 'success'
      case 'mobile_money': return 'default'
      case 'bank_transfer': return 'secondary'
      case 'credit': return 'warning'
      default: return 'secondary'
    }
  }

  const generateSalePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    doc.setFontSize(20)
    doc.text('Sales Receipt', pageWidth / 2, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text(`Date: ${format(new Date(sale.sale_date), 'PPP')}`, 20, 40)
    doc.text(`Customer: ${sale.customer?.name || 'Walk-in Customer'}`, 20, 50)
    doc.text(`Payment Method: ${sale.payment_method.replace('_', ' ')}`, 20, 60)
    
    doc.setFontSize(14)
    doc.text(`Total Amount: Le ${sale.total_amount.toLocaleString()}`, 20, 80)
    
    if (sale.notes) {
      doc.setFontSize(10)
      doc.text('Notes:', 20, 100)
      doc.text(sale.notes, 20, 110)
    }
    
    return doc
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Customer
              </div>
              <p className="font-medium">{sale.customer?.name || 'Walk-in Customer'}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Date
              </div>
              <p className="font-medium">{new Date(sale.sale_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Amount
              </div>
              <p className="font-bold text-lg text-prosperity-green">
                Le {sale.total_amount.toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </div>
              <Badge variant={getPaymentMethodVariant(sale.payment_method)}>
                {sale.payment_method.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {sale.customer?.email && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Email</div>
              <p className="font-medium">{sale.customer.email}</p>
            </div>
          )}

          {sale.customer?.phone && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Phone</div>
              <p className="font-medium">{sale.customer.phone}</p>
            </div>
          )}

          {sale.notes && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Notes
              </div>
              <p className="text-sm bg-muted p-3 rounded-lg">{sale.notes}</p>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Created: {new Date(sale.created_at).toLocaleString()}
            </div>
          </div>

          <div className="pt-4">
            <ShareButton
              documentType="sale"
              documentData={{
                date: format(new Date(sale.sale_date), 'PPP'),
                customer: sale.customer?.name || 'Walk-in Customer',
                total: `Le ${sale.total_amount.toLocaleString()}`,
                paymentMethod: sale.payment_method.replace('_', ' ')
              }}
              generatePDF={generateSalePDF}
              subject={`Sales Receipt - ${format(new Date(sale.sale_date), 'PPP')}`}
              fileName={`sale-receipt-${sale.id}.pdf`}
              whatsappMessage={`Sales Receipt for Le ${sale.total_amount.toLocaleString()} - ${format(new Date(sale.sale_date), 'PPP')}`}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}