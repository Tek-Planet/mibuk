import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers'

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function InviteMemberModal({ open, onOpenChange }: InviteMemberModalProps) {
  const { inviteMember } = useOrganizationMembers()
  const [email, setEmail] = useState('')
  const [selectedPages, setSelectedPages] = useState<string[]>(['dashboard'])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || selectedPages.length === 0) return

    setLoading(true)
    await inviteMember(email, selectedPages)
    setLoading(false)
    
    // Reset and close
    setEmail('')
    setSelectedPages(['dashboard'])
    onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />
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
                    id={page.value}
                    checked={selectedPages.includes(page.value)}
                    onCheckedChange={() => togglePage(page.value)}
                  />
                  <label
                    htmlFor={page.value}
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
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !email || selectedPages.length === 0}
              className="flex-1"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
