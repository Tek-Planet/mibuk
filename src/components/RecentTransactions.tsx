import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useSales } from '@/hooks/useSales'
import { useInvoices } from '@/hooks/useInvoices'
import { useBusinessInfo } from '@/hooks/useBusinessInfo'
import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'

export function RecentTransactions() {
  const { sales } = useSales()
  const { invoices } = useInvoices()
  const { businessInfo: business } = useBusinessInfo()

  const transactions = useMemo(() => {
    const currency = business?.currency || 'SLL'
    const formatCurrency = (amount: number) => {
      if (currency === 'SLL') {
        return `Le ${amount.toLocaleString()}`
      }
      return `${currency} ${amount.toLocaleString()}`
    }

    // Combine sales and invoices into transactions
    const allTransactions = [
      ...sales.slice(0, 5).map(sale => ({
        id: sale.id,
        type: 'income' as const,
        description: sale.customer?.name ? `Sale to ${sale.customer.name}` : 'Walk-in Sale',
        amount: formatCurrency(Number(sale.total_amount)),
        date: formatDistanceToNow(new Date(sale.created_at), { addSuffix: true }),
        status: 'completed' as const
      })),
      ...invoices.slice(0, 3).map(invoice => ({
        id: invoice.id,
        type: 'income' as const,
        description: `Invoice ${invoice.invoice_number}${invoice.customer?.name ? ` - ${invoice.customer.name}` : ''}`,
        amount: formatCurrency(Number(invoice.total_amount)),
        date: formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true }),
        status: invoice.status === 'paid' ? 'completed' as const : 'pending' as const
      }))
    ]

    // Sort by date and take the 6 most recent
    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
  }, [sales, invoices, business?.currency])

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <p className="text-sm">No recent transactions</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              transaction.type === 'income' 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {transaction.type === 'income' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownLeft className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">{transaction.date}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold text-sm ${
              transaction.type === 'income' ? 'text-success' : 'text-destructive'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{transaction.amount}
            </p>
            <p className={`text-xs ${
              transaction.status === 'completed' ? 'text-success' : 'text-warning'
            }`}>
              {transaction.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}