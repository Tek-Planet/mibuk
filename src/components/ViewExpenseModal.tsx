import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'

interface ViewExpenseModalProps {
  expense: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function ViewExpenseModal({ expense, open, onOpenChange, onClose }: ViewExpenseModalProps) {
  if (!expense) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogDescription>
            View complete expense information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="text-lg font-semibold">{expense.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                <p className="text-xl font-bold text-primary">
                  SLL {Number(expense.amount).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                <p className="text-lg">{format(new Date(expense.expense_date), 'MMMM dd, yyyy')}</p>
              </div>
            </div>

            {expense.category && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                <Badge variant="outline" className="mt-1">
                  {expense.category}
                </Badge>
              </div>
            )}

            {expense.supplier?.name && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
                <p className="text-lg">{expense.supplier.name}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
              <Badge variant="secondary" className="mt-1">
                {expense.payment_method?.replace('_', ' ') || 'Cash'}
              </Badge>
            </div>

            {expense.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p className="text-sm bg-muted p-3 rounded-md mt-1">{expense.notes}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span>
              <br />
              {format(new Date(expense.created_at), 'MMM dd, yyyy HH:mm')}
            </div>
            <div>
              <span className="font-medium">Updated:</span>
              <br />
              {format(new Date(expense.updated_at), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}