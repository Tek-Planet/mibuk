import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, AlertTriangle, TrendingUp, Edit, Trash2, Eye, X } from 'lucide-react'
import { useState } from 'react'
import { useInventory, type InventoryItem } from '@/hooks/useInventory'
import { useLanguage } from '@/contexts/LanguageContext'
import { AddInventoryModal } from '@/components/inventory/AddInventoryModal'
import { EditInventoryModal } from '@/components/inventory/EditInventoryModal'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

const Inventory = () => {
  const { t } = useLanguage()
  const { 
    inventory, 
    loading, 
    updateStock, 
    deleteInventoryItem, 
    getStockStatus, 
    criticalItems, 
    lowItems, 
    outOfStockItems, 
    totalValue,
    fetchInventory
  } = useInventory()
  
  const [filter, setFilter] = useState('all')
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive'
      case 'low': return 'secondary'
      case 'good': return 'default'
      case 'out': return 'destructive'
      default: return 'secondary'
    }
  }

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true
    const status = getStockStatus(item)
    return status === filter
  })

  const handleDelete = async () => {
    if (!deletingItem) return
    
    try {
      await deleteInventoryItem(deletingItem.id)
      setDeletingItem(null)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('inventory.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('inventory.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t('inventory.description')}</p>
          </div>
          <AddInventoryModal onItemAdded={fetchInventory} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t('inventory.totalItems')}</span>
              </div>
              <div className="text-2xl font-bold mt-2">{inventory.length}</div>
            </CardContent>
          </Card>
          
          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-prosperity-green" />
                <span className="text-sm font-medium">{t('inventory.totalValue')}</span>
              </div>
              <div className="text-2xl font-bold mt-2">Le {totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span className="text-sm font-medium">{t('inventory.lowStock')}</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-warning">{lowItems}</div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium">{t('inventory.outOfStock')}</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-destructive">{outOfStockItems}</div>
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
            {t('inventory.allItems')} ({inventory.length})
          </Button>
          <Button 
            variant={filter === 'critical' ? 'destructive' : 'outline'} 
            onClick={() => setFilter('critical')}
            size="sm"
          >
            {t('inventory.critical')} ({criticalItems})
          </Button>
          <Button 
            variant={filter === 'low' ? 'secondary' : 'outline'} 
            onClick={() => setFilter('low')}
            size="sm"
          >
            {t('inventory.lowStock')} ({lowItems})
          </Button>
          <Button 
            variant={filter === 'out' ? 'destructive' : 'outline'} 
            onClick={() => setFilter('out')}
            size="sm"
          >
            {t('inventory.outOfStock')} ({outOfStockItems})
          </Button>
        </div>

        {/* Inventory Table */}
        <Card className="professional-card">
          <CardHeader>
            <CardTitle>{t('inventory.stockOverview')} ({filteredInventory.length} {t('inventory.items')})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {filter === 'all' ? t('inventory.noItems') : `${t('inventory.no')} ${filter} ${t('inventory.stockItems')}`}
                </p>
                {filter === 'all' && (
                  <AddInventoryModal>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('inventory.addFirst')}
                    </Button>
                  </AddInventoryModal>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item)
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-sm sm:text-base">{item.name}</h3>
                            {!item.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {item.category} • Le {item.unit_price.toLocaleString()}
                            {item.sku && ` • SKU: ${item.sku}`}
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                        <Badge variant={getStatusColor(status)} className="text-xs whitespace-nowrap">
                          {item.stock_quantity} {status === 'out' ? 'out' : 'stock'}
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateStock(item.id, item.stock_quantity - 1)}
                            disabled={item.stock_quantity === 0}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 sm:w-12 text-center font-medium text-xs sm:text-sm">
                            {item.stock_quantity}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateStock(item.id, item.stock_quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingItem(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setDeletingItem(item)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <EditInventoryModal 
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('inventory.deleteItem')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('inventory.deleteConfirm')} "{deletingItem?.name}"
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
};

export default Inventory;