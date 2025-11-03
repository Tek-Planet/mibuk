import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Trash2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string
  currentFilePath?: string
  userInitials: string
  onPhotoUpdate?: (photoUrl: string | null) => void
}

export function ProfilePhotoUpload({ currentPhotoUrl, currentFilePath, userInitials, onPhotoUpdate }: ProfilePhotoUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null)
  const [filePath, setFilePath] = useState<string | null>(currentFilePath || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    console.log('🔍 Upload started, file:', file, 'user:', user)
    console.log('🔍 User ID:', user?.id, 'Auth UID should match this')
    
    if (!file) {
      console.log('❌ No file selected')
      toast.error('Please select a file')
      return
    }
    
    if (!user || !user.id) {
      console.log('❌ User not authenticated', user)
      toast.error('Please log in first to upload photos')
      return
    }

    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type)
      toast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      console.log('❌ File too large:', file.size)
      toast.error('Image size must be less than 2MB')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/profile-photo.${fileExt}`
      console.log('📁 Upload filename:', fileName)

      // If an old file exists, remove it first
      if (filePath) {
        console.log('🗑️ Removing old file:', filePath)
        const { error: removeError } = await supabase.storage
          .from('profile-documents')
          .remove([filePath])
        if (removeError) {
          console.log('⚠️ Error removing old file:', removeError)
        }
      }

      // Upload new photo
      console.log('⬆️ Starting upload to storage...')
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile-documents')
        .upload(fileName, file, { upsert: true })
      
      console.log('⬆️ Upload result:', { uploadError, uploadData })
      if (uploadError) throw uploadError

      // Create a signed URL (works even if bucket is private)
      console.log('🔗 Creating signed URL...')
      const { data: signed, error: signedError } = await supabase.storage
        .from('profile-documents')
        .createSignedUrl(fileName, 3600) // 1 hour
      
      console.log('🔗 Signed URL result:', { signed, signedError })
      if (signedError) throw signedError

      // Ensure only one profile_photo row by deleting old rows, then insert
      console.log('🗃️ Deleting old database records...')
      const { error: deleteError } = await supabase
        .from('profile_documents')
        .delete()
        .eq('user_id', user.id)
        .eq('document_type', 'profile_photo')
      
      console.log('🗃️ Delete result:', { deleteError })

      console.log('💾 Inserting new database record...')
      console.log('💾 Insert data will be:', { 
        user_id: user.id,
        file_name: file.name,
        file_path: fileName,
        document_type: 'profile_photo',
        file_size: file.size
      })
      
      const { error: insertError, data: insertData } = await supabase
        .from('profile_documents')
        .insert([{ 
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          document_type: 'profile_photo',
          file_size: file.size
        }])
      
      console.log('💾 Insert result:', { insertError, insertData })
      if (insertError) throw insertError

      setPhotoUrl(signed?.signedUrl || null)
      setFilePath(fileName)
      onPhotoUpdate?.(signed?.signedUrl || null)
      toast.success('Profile photo updated successfully')

      if (fileInputRef.current) fileInputRef.current.value = ''
      console.log('✅ Upload completed successfully')
    } catch (error) {
      console.error('❌ Error uploading photo:', error)
      toast.error('Failed to upload photo: ' + (error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!user || !filePath) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('profile-documents')
        .remove([filePath])
      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('profile_documents')
        .delete()
        .eq('user_id', user.id)
        .eq('document_type', 'profile_photo')
      if (dbError) throw dbError

      setPhotoUrl(null)
      setFilePath(null)
      onPhotoUpdate?.(null)
      toast.success('Profile photo removed successfully')
    } catch (error) {
      console.error('Error removing photo:', error)
      toast.error('Failed to remove photo')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
        {photoUrl ? (
          <AvatarImage src={photoUrl} alt="Profile photo" />
        ) : (
          <AvatarFallback className="text-base sm:text-lg font-semibold">
            {userInitials}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="space-y-2 w-full sm:w-auto">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            {uploading ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
          
          {photoUrl && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRemovePhoto}
              className="w-full sm:w-auto text-xs sm:text-sm text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Remove Photo
            </Button>
          )}
        </div>
        
        <p className="text-xs sm:text-sm text-muted-foreground">
          JPG, PNG or GIF. Max 2MB.
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>
    </div>
  )
}