import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { toast } from 'sonner'

interface DocumentUploadProps {
  type: 'business' | 'profile'
  title: string
  description: string
  documentTypes: { value: string; label: string }[]
  maxFiles?: number
}

interface UploadedDocument {
  id: string
  file_name: string
  file_path: string
  document_type: string
  file_size: number
  uploaded_at: string
}

export function DocumentUpload({ type, title, description, documentTypes, maxFiles = 5 }: DocumentUploadProps) {
  const { user } = useAuth()
  const { business } = useUserProfile()
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [selectedType, setSelectedType] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing documents
  const loadDocuments = async () => {
    if (!user) return

    try {
      const tableName = type === 'business' ? 'business_documents' : 'profile_documents'
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  // Load documents on mount
  useEffect(() => {
    loadDocuments()
  }, [user])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedType || !user) return

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const bucketName = type === 'business' ? 'business-documents' : 'profile-documents'

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Save to database
      const tableName = type === 'business' ? 'business_documents' : 'profile_documents'
      const documentData = {
        user_id: user.id,
        ...(type === 'business' && business ? { business_id: business.id } : {}),
        file_name: file.name,
        file_path: fileName,
        document_type: selectedType,
        file_size: file.size
      }

      const { error: dbError } = await supabase
        .from(tableName)
        .insert([documentData])

      if (dbError) throw dbError

      toast.success('Document uploaded successfully')
      setSelectedType('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadDocuments()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (docId: string, filePath: string) => {
    try {
      const bucketName = type === 'business' ? 'business-documents' : 'profile-documents'
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath])

      if (storageError) throw storageError

      // Delete from database
      const tableName = type === 'business' ? 'business_documents' : 'profile_documents'
      const { error: dbError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', docId)

      if (dbError) throw dbError

      toast.success('Document deleted successfully')
      loadDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDocumentTypeCount = () => {
    const typeCounts: { [key: string]: number } = {}
    documents.forEach(doc => {
      typeCounts[doc.document_type] = (typeCounts[doc.document_type] || 0) + 1
    })
    return typeCounts
  }

  const getCreditScoreImpact = () => {
    const docCount = documents.length
    if (docCount === 0) return { impact: 'None', color: 'destructive', icon: AlertTriangle }
    if (docCount < 3) return { impact: 'Low', color: 'warning', icon: AlertTriangle }
    return { impact: 'High', color: 'success', icon: CheckCircle }
  }

  const creditImpact = getCreditScoreImpact()

  return (
    <Card className="professional-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <creditImpact.icon className="h-3 w-3" />
            Credit Impact: {creditImpact.impact}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="space-y-3">
          <div>
            <Label htmlFor={`${type}-document-type`}>Document Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((docType) => (
                  <SelectItem key={docType.value} value={docType.value}>
                    {docType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`${type}-file`}>Upload Document</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                id={`${type}-file`}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading || !selectedType || documents.length >= maxFiles}
                className="flex-1"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !selectedType || documents.length >= maxFiles}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Browse'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accepted formats: PDF, JPG, PNG, DOC, DOCX. Max size: 5MB
            </p>
          </div>
        </div>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Uploaded Documents ({documents.length}/{maxFiles})</h4>
            </div>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{doc.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                        </Badge>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credit Score Tips */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h5 className="font-medium text-sm mb-1">💡 Credit Score Tips</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Upload official business registration documents</li>
            <li>• Include tax documentation for better verification</li>
            <li>• Clear, readable images improve processing</li>
            <li>• More documents = higher credibility score</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}