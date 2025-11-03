import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useActivityLogs } from '@/hooks/useActivityLogs'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLogsTableProps {
  ngoId?: string
}

export function ActivityLogsTable({ ngoId }: ActivityLogsTableProps) {
  const { logs, loading } = useActivityLogs(100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
        <CardDescription>Recent user activities across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading activity logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground">No activity logs yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    {log.entity_type ? (
                      <span className="text-sm text-muted-foreground">
                        {log.entity_type}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
