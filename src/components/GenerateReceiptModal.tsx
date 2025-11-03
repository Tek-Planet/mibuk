import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Receipt, Share, Download } from 'lucide-react'
import { ShareButton } from '@/components/ShareButton'
import jsPDF from 'jspdf'

interface GenerateReceiptModalProps {
  sale: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateReceiptModal({ sale, open, onOpenChange }: GenerateReceiptModalProps) {
  const generateReceiptText = () => {
    const saleDate = new Date(sale.sale_date).toLocaleDateString()
    const customerName = sale.customer?.name || 'Walk-in Customer'
    
    return `
🧾 RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: ${saleDate}
👤 Customer: ${customerName}
💳 Payment: ${sale.payment_method.replace('_', ' ').toUpperCase()}

💰 TOTAL: Le ${sale.total_amount.toFixed(2)}

${sale.notes ? `📝 Notes: ${sale.notes}` : ''}

Thank you for your business! 🙏
━━━━━━━━━━━━━━━━━━━━━━━━━
Generated via MiBuks Business Hub
`.trim()
  }

  const generateReceiptPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const saleDate = new Date(sale.sale_date).toLocaleDateString()
    const customerName = sale.customer?.name || 'Walk-in Customer'
    
    // Header
    doc.setFontSize(20)
    doc.text('RECEIPT', pageWidth / 2, 20, { align: 'center' })
    
    // Content
    doc.setFontSize(12)
    let yPos = 40
    doc.text(`Date: ${saleDate}`, 20, yPos)
    yPos += 10
    doc.text(`Customer: ${customerName}`, 20, yPos)
    yPos += 10
    doc.text(`Payment Method: ${sale.payment_method.replace('_', ' ').toUpperCase()}`, 20, yPos)
    yPos += 15
    
    doc.setFontSize(14)
    doc.text(`TOTAL: Le ${sale.total_amount.toFixed(2)}`, 20, yPos)
    yPos += 15
    
    if (sale.notes) {
      doc.setFontSize(10)
      doc.text(`Notes: ${sale.notes}`, 20, yPos)
    }
    
    yPos += 20
    doc.setFontSize(10)
    doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' })
    
    return doc
  }

  const handleCopyReceipt = async () => {
    const receiptText = generateReceiptText()
    try {
      await navigator.clipboard.writeText(receiptText)
      // Could show a toast here
    } catch (err) {
      console.error('Failed to copy receipt:', err)
    }
  }

  const handleDownloadReceipt = () => {
    const receiptText = generateReceiptText()
    const blob = new Blob([receiptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${sale.id.slice(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Sale Receipt
          </DialogTitle>
          <DialogDescription>
            Share or download the receipt for this sale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Receipt Preview */}
          <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-line">
            {generateReceiptText()}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <ShareButton
              documentType="sale"
              documentData={{
                date: new Date(sale.sale_date).toLocaleDateString(),
                customer: sale.customer?.name || 'Walk-in Customer',
                total: `Le ${sale.total_amount.toFixed(2)}`,
                paymentMethod: sale.payment_method.replace('_', ' ').toUpperCase()
              }}
              generatePDF={generateReceiptPDF}
              subject={`Receipt - ${sale.customer?.name || 'Walk-in Customer'}`}
              fileName={`receipt-${sale.id.slice(0, 8)}.pdf`}
              whatsappMessage={generateReceiptText()}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleCopyReceipt} 
                variant="outline"
              >
                <Share className="h-4 w-4" />
                Copy Receipt
              </Button>
              
              <Button 
                onClick={handleDownloadReceipt} 
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}