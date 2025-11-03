import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Truck, Phone, MapPin, Package, Edit, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import { useSuppliers } from '@/hooks/useSuppliers'
import { AddSupplierModal } from '@/components/AddSupplierModal'
import { EditSupplierModal } from '@/components/EditSupplierModal'
import { ViewSupplierModal } from '@/components/ViewSupplierModal'
import { formatDistanceToNow } from 'date-fns'

export default function Suppliers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  
  const { suppliers, loading, deleteSupplier } = useSuppliers()

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.product_category?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && supplier.current_balance > 0) ||
                         (filter === 'zero_balance' && supplier.current_balance === 0)

    return matchesSearch && matchesFilter
  })

  const handleDeleteSupplier = async (supplierId: string) => {
    if (confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      await deleteSupplier(supplierId)
    }
  }

  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter(s => s.current_balance > 0).length
  const totalBalance = suppliers.reduce((sum, s) => sum + s.current_balance, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground">Manage your suppliers and expenses</p>
        </div>
        <AddSupplierModal />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="professional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {activeSuppliers} with outstanding balance
            </p>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Le {totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total amount owed to suppliers
            </p>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Suppliers with current balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Suppliers
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Outstanding Balance
          </Button>
          <Button
            variant={filter === 'zero_balance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('zero_balance')}
          >
            Zero Balance
          </Button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle>Suppliers List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No suppliers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first supplier'
                }
              </p>
              {!searchQuery && filter === 'all' && <AddSupplierModal />}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Supplier</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[120px]">Contact</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[100px]">Category</TableHead>
                    <TableHead className="min-w-[100px]">Balance</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[120px]">Last Updated</TableHead>
                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{supplier.name}</div>
                          {supplier.location && (
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {supplier.location}
                            </div>
                          )}
                          {/* Show phone on mobile */}
                          <div className="sm:hidden mt-1">
                            {supplier.phone && (
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3" />
                                {supplier.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {supplier.phone && (
                          <div className="flex items-center gap-1 text-xs sm:text-sm">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {supplier.product_category && (
                          <Badge variant="secondary" className="text-xs">{supplier.product_category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs sm:text-sm ${supplier.current_balance > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                          Le {supplier.current_balance.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs sm:text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(supplier.updated_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSupplier(supplier)
                              setViewModalOpen(true)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSupplier(supplier)
                              setEditModalOpen(true)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
      {selectedSupplier && (
        <>
          <EditSupplierModal
            supplier={selectedSupplier}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onClose={() => setSelectedSupplier(null)}
          />
          <ViewSupplierModal
            supplier={selectedSupplier}
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            onClose={() => setSelectedSupplier(null)}
          />
        </>
      )}
    </div>
  )
}