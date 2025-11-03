import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers'
import { useLanguage } from '@/contexts/LanguageContext'
import { UserPlus, Mail, Trash2, Settings, Loader2 } from 'lucide-react'
import { InviteMemberModal } from './InviteMemberModal'
import { EditMemberAccessModal } from './EditMemberAccessModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function TeamManagement() {
  const { t } = useLanguage()
  const { members, invitations, loading, removeMember, cancelInvitation } = useOrganizationMembers()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [editMemberId, setEditMemberId] = useState<string | null>(null)
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null)
  const [cancelInvitationId, setCancelInvitationId] = useState<string | null>(null)

  const getPageName = (page: string) => {
    const pageNames: Record<string, string> = {
      dashboard: 'Dashboard',
      invoices: 'Invoices',
      customers: 'Customers',
      sales: 'Sales',
      inventory: 'Inventory',
      expenses: 'Expenses',
      suppliers: 'Suppliers',
      credit: 'Credit',
      reports: 'Reports'
    }
    return pageNames[page] || page
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Invite and manage team members</p>
        </div>
        <Button onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>People who have access to your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No team members yet. Invite someone to get started.
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {member.display_name || member.email || `User ${member.user_id.slice(0, 8)}`}
                      </p>
                      {member.role === 'owner' && (
                        <Badge variant="secondary">Owner</Badge>
                      )}
                    </div>
                    {member.email && (
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.accessible_pages.map((page) => (
                        <Badge key={page} variant="outline" className="text-xs">
                          {getPageName(page)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditMemberId(member.id)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRemoveMemberId(member.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Invitations waiting to be accepted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {invitation.accessible_pages.map((page) => (
                          <Badge key={page} variant="outline" className="text-xs">
                            {getPageName(page)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCancelInvitationId(invitation.id)}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <InviteMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />

      {editMemberId && (
        <EditMemberAccessModal
          memberId={editMemberId}
          onClose={() => setEditMemberId(null)}
        />
      )}

      <AlertDialog open={!!removeMemberId} onOpenChange={() => setRemoveMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from your team? They will lose access to your business data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeMemberId) {
                  removeMember(removeMemberId)
                  setRemoveMemberId(null)
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!cancelInvitationId} onOpenChange={() => setCancelInvitationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cancelInvitationId) {
                  cancelInvitation(cancelInvitationId)
                  setCancelInvitationId(null)
                }
              }}
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
