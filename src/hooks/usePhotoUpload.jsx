import { useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'

const usePhotoUpload = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const uploadPhoto = async (file, folder = '') => {
    if (!user) {
      throw new Error('User harus login terlebih dahulu')
    }

    setUploading(true)
    setUploadError(null)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('order-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('order-photos')
        .getPublicUrl(filePath)

      return {
        fileName: file.name,
        filePath: uploadData.path,
        publicUrl: publicUrl,
        fileSize: file.size,
        mimeType: file.type
      }

    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error.message)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const deletePhoto = async (filePath) => {
    try {
      const { error } = await supabase.storage
        .from('order-photos')
        .remove([filePath])

      if (error) throw error
      
      return true
    } catch (error) {
      console.error('Delete error:', error)
      setUploadError(error.message)
      throw error
    }
  }

  const validateFile = (file, maxSize = 50 * 1024 * 1024) => {
    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      throw new Error(`File ${file.name} bukan file gambar yang valid`)
    }

    // Validasi ukuran file
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      throw new Error(`File ${file.name} terlalu besar. Maksimal ${maxSizeMB}MB`)
    }

    return true
  }

  return {
    uploadPhoto,
    deletePhoto,
    validateFile,
    uploading,
    uploadError
  }
}

export default usePhotoUpload 