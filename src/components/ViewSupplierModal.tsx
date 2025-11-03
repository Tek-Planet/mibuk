import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Truck, Phone, MapPin, Package, MessageSquare, Calendar, DollarSign, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ViewSupplierModalProps {
  supplier: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function ViewSupplierModal({ supplier, open, onOpenChange, onClose }: ViewSupplierModalProps) {
  const handleCallSupplier = () => {
    if (supplier.phone) {
      window.open(`tel:${supplier.phone}`)
    }
  }

  const handleWhatsAppSupplier = () => {
    if (supplier.phone) {
      const cleanPhone = supplier.phone.replace(/[^\d]/g, '')
      window.open(`https://wa.me/${cleanPhone}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Supplier Details
          </DialogTitle>
          <DialogDescription>
            View supplier information and contact details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{supplier.name}</h3>
              {supplier.product_category && (
                <Badge variant="secondary" className="mt-2">
                  {supplier.product_category.replace('_', ' ')}
                </Badge>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              {supplier.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.phone}</span>
                  <div className="flex gap-2 ml-auto">
                    <Button size="sm" variant="outline" onClick={handleCallSupplier}>
                      Call
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleWhatsAppSupplier}>
                      WhatsApp
                    </Button>
                  </div>
                </div>
              )}

              {supplier.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.location}</span>
                </div>
              )}
            </div>

            {/* Balance Info */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Outstanding Balance</span>
              </div>
              <div className="text-2xl font-bold">
                <span className={supplier.current_balance > 0 ? 'text-orange-600' : 'text-muted-foreground'}>
                  Le {supplier.current_balance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {supplier.notes && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Notes</span>
                </div>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {supplier.notes}
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Added {formatDistanceToNow(new Date(supplier.created_at), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>Last updated {formatDistanceToNow(new Date(supplier.updated_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
            {supplier.phone && (
              <Button onClick={handleWhatsAppSupplier} className="flex-1">
                <MessageCircle className="h-4 w-4" />
                Contact Supplier
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}