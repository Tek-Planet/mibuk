import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers'

interface EditMemberAccessModalProps {
  memberId: string
  onClose: () => void
}

const AVAILABLE_PAGES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'customers', label: 'Customers' },
  { value: 'sales', label: 'Sales' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'suppliers', label: 'Suppliers' },
  { value: 'credit', label: 'Credit' },
  { value: 'reports', label: 'Reports' }
]

export function EditMemberAccessModal({ memberId, onClose }: EditMemberAccessModalProps) {
  const { members, updateMemberAccess } = useOrganizationMembers()
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const member = members.find(m => m.id === memberId)

  useEffect(() => {
    if (member) {
      setSelectedPages(member.accessible_pages)
    }
  }, [member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPages.length === 0) return

    setLoading(true)
    await updateMemberAccess(memberId, selectedPages)
    setLoading(false)
    onClose()
  }

  const togglePage = (page: string) => {
    setSelectedPages(prev =>
      prev.includes(page)
        ? prev.filter(p => p !== page)
        : [...prev, page]
    )
  }

  const selectAll = () => {
    setSelectedPages(AVAILABLE_PAGES.map(p => p.value))
  }

  const deselectAll = () => {
    setSelectedPages([])
  }

  if (!member) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Member Access</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Editing access for: <span className="font-medium">{member.email || member.display_name || `User ${member.user_id.slice(0, 8)}`}</span>
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Page Access</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={deselectAll}
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
              {AVAILABLE_PAGES.map((page) => (
                <div key={page.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${page.value}`}
                    checked={selectedPages.includes(page.value)}
                    onCheckedChange={() => togglePage(page.value)}
                  />
                  <label
                    htmlFor={`edit-${page.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {page.label}
                  </label>
                </div>
              ))}
            </div>
            {selectedPages.length === 0 && (
              <p className="text-sm text-destructive mt-2">
                Please select at least one page
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedPages.length === 0}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
