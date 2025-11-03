import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TrendingUp, Plus, DollarSign, Calendar, Search, Edit, Trash2, Eye, Receipt } from 'lucide-react'
import { RecordSaleModal } from '@/components/RecordSaleModal'
import { ViewSaleModal } from '@/components/ViewSaleModal'
import { EditSaleModal } from '@/components/EditSaleModal'
import { GenerateReceiptModal } from '@/components/GenerateReceiptModal'
import { useState } from 'react'
import { useSales } from '@/hooks/useSales'
import { useInvoices } from '@/hooks/useInvoices'
import { useLanguage } from '@/contexts/LanguageContext'

const Sales = () => {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedSale, setSelectedSale] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const { sales, loading, deleteSale, refetch } = useSales()
  const { invoices } = useInvoices()

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.payment_method.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    return matchesSearch && sale.payment_method === filter
  })

  const getPaymentMethodVariant = (method: string) => {
    switch (method) {
      case 'cash': return 'success'
      case 'mobile_money': return 'default'
      case 'bank_transfer': return 'secondary'
      case 'credit': return 'warning'
      default: return 'secondary'
    }
  }

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm(t('sales.confirmDelete'))) return
    await deleteSale(saleId)
  }

  const salesRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const invoiceRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + Number(invoice.total_amount), 0)
  const totalRevenue = salesRevenue + invoiceRevenue
  const todaySales = sales.filter(s => 
    new Date(s.sale_date).toDateString() === new Date().toDateString()
  ).length
  const creditSales = sales.filter(s => s.payment_method === 'credit')
  const creditAmount = creditSales.reduce((sum, sale) => sum + sale.total_amount, 0)

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('sales.title')}</h1>
            <p className="text-muted-foreground">{t('sales.description')}</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-pulse">{t('sales.loading')}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('sales.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('sales.description')}</p>
        </div>
        <RecordSaleModal onSaleCreated={refetch} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-prosperity-green" />
              <span className="text-sm font-medium">{t('sales.totalRevenue')}</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-prosperity-green">Le {totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium">{t('sales.creditSales')}</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-warning">Le {creditAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{t('sales.todaySales')}</span>
            </div>
            <div className="text-2xl font-bold mt-2">{todaySales}</div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-info" />
              <span className="text-sm font-medium">{t('sales.totalOrders')}</span>
            </div>
            <div className="text-2xl font-bold mt-2">{sales.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          onClick={() => setFilter('all')}
          size="sm"
        >
          {t('sales.allSales')}
        </Button>
        <Button 
          variant={filter === 'cash' ? 'success' : 'outline'} 
          onClick={() => setFilter('cash')}
          size="sm"
        >
          {t('sales.cash')}
        </Button>
        <Button 
          variant={filter === 'mobile_money' ? 'default' : 'outline'} 
          onClick={() => setFilter('mobile_money')}
          size="sm"
        >
          {t('sales.mobileMoney')}
        </Button>
        <Button 
          variant={filter === 'credit' ? 'warning' : 'outline'} 
          onClick={() => setFilter('credit')}
          size="sm"
        >
          {t('sales.credit')}
        </Button>
      </div>

      {/* Search */}
      <Card className="professional-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('sales.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle>{t('sales.recentSales')} ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('sales.noSales')}</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? t('sales.adjustSearch') : t('sales.recordFirst')}
              </p>
              {!searchQuery && <RecordSaleModal onSaleCreated={refetch} />}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">{t('sales.customer')}</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[100px]">{t('sales.date')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('sales.amount')}</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[120px]">{t('sales.paymentMethod')}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t('sales.notes')}</TableHead>
                    <TableHead className="text-right min-w-[100px]">{t('sales.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{sale.customer?.name || 'Walk-in Customer'}</div>
                          <div className="sm:hidden text-xs text-muted-foreground mt-1">
                            {new Date(sale.sale_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">
                        Le {sale.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={getPaymentMethodVariant(sale.payment_method)}>
                          {sale.payment_method.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{sale.notes || '-'}</TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => {
                               setSelectedSale(sale)
                               setReceiptModalOpen(true)
                             }}
                             title="Generate Receipt"
                           >
                             <Receipt className="h-4 w-4" />
                           </Button>
                           <ViewSaleModal sale={sale} />
                           <EditSaleModal sale={sale} />
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => handleDeleteSale(sale.id)}
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

      {/* Modals */}
      {selectedSale && (
        <GenerateReceiptModal
          sale={selectedSale}
          open={receiptModalOpen}
          onOpenChange={setReceiptModalOpen}
        />
      )}
    </div>
  );
};

export default Sales;