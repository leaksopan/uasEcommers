import { useState, useRef } from 'react'
import { supabase } from '../../../services/supabase'
import { useAuth } from '../../../contexts/AuthContext'

const PhotoUpload = ({ 
  orderItemId = null,
  productName = '',
  variantName = '',
  maxFiles = 10,
  onUploadComplete = () => {},
  onUploadError = () => {},
  disabled = false
}) => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return
    
    const validFiles = Array.from(files).filter(file => {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} bukan file gambar yang valid`)
        return false
      }
      
      // Validasi ukuran file (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar. Maksimal 50MB`)
        return false
      }
      
      return true
    })
    
    if (uploadedFiles.length + validFiles.length > maxFiles) {
      alert(`Maksimal ${maxFiles} foto yang dapat diupload`)
      return
    }
    
    uploadFiles(validFiles)
  }

  const uploadFiles = async (files) => {
    if (!user) {
      alert('Anda harus login terlebih dahulu')
      return
    }

    setUploading(true)
    
    try {
      const uploadPromises = files.map(async (file) => {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('order-photos')
          .upload(filePath, file)
          
        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }
        
        // Get public URL - pastikan menggunakan path yang benar
        const { data: { publicUrl } } = supabase.storage
          .from('order-photos')
          .getPublicUrl(uploadData.path)
        
        console.log('Upload successful:', {
          originalName: file.name,
          uploadedPath: uploadData.path,
          publicUrl: publicUrl
        })
        
        const fileData = {
          id: Math.random().toString(36).substring(2),
          fileName: file.name,
          filePath: uploadData.path,
          publicUrl: publicUrl,
          fileSize: file.size,
          mimeType: file.type,
          uploadStatus: 'completed'
        }
        
        // Save to database if orderItemId is provided
        if (orderItemId) {
          const { error: dbError } = await supabase
            .from('order_photos')
            .insert({
              order_item_id: orderItemId,
              file_name: file.name,
              file_path: uploadData.path,
              file_size: file.size,
              mime_type: file.type,
              upload_status: 'completed',
              sort_order: uploadedFiles.length
            })
            
          if (dbError) {
            console.error('Database error:', dbError)
            throw dbError
          }
        }
        
        return fileData
      })
      
      const results = await Promise.all(uploadPromises)
      const newFiles = [...uploadedFiles, ...results]
      setUploadedFiles(newFiles)
      onUploadComplete(newFiles)
      
      console.log('All files uploaded successfully:', newFiles)
      
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError(error.message)
      alert('Gagal mengupload foto: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = async (fileIndex) => {
    try {
      const file = uploadedFiles[fileIndex]
      
      // Delete from storage
      if (file.filePath) {
        const { error: deleteError } = await supabase.storage
          .from('order-photos')
          .remove([file.filePath])
          
        if (deleteError) {
          console.error('Delete error:', deleteError)
        }
      }
      
      // Remove from state
      const newFiles = uploadedFiles.filter((_, index) => index !== fileIndex)
      setUploadedFiles(newFiles)
      onUploadComplete(newFiles)
      
    } catch (error) {
      console.error('Delete error:', error)
      alert('Gagal menghapus foto: ' + error.message)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Upload Foto {productName}
          {variantName && <span className="text-gray-600"> - {variantName}</span>}
        </h3>
        <p className="text-sm text-gray-600">
          Upload foto yang akan dicetak. Maksimal {maxFiles} foto, format: JPG, PNG, GIF, WEBP (maks. 50MB per file)
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-indigo-500 bg-indigo-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || uploading}
        />

        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          {uploading ? (
            <div>
              <p className="text-indigo-600 font-medium">Mengupload foto...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '50%' }}></div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">
                <span className="font-medium text-indigo-600 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  Klik untuk upload
                </span>{' '}
                atau drag & drop foto di sini
              </p>
              <p className="text-sm text-gray-500">
                {uploadedFiles.length}/{maxFiles} foto telah diupload
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Foto yang Diupload:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {file.publicUrl ? (
                    <img
                      src={file.publicUrl}
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log('Image loaded:', file.publicUrl)}
                      onError={(e) => {
                        console.error('Image load error:', file.publicUrl, e)
                        // Fallback jika gambar gagal dimuat
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Fallback content jika gambar tidak bisa dimuat */}
                  <div className="w-full h-full flex-col items-center justify-center text-gray-400 text-xs p-2" style={{ display: 'none' }}>
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>Preview tidak tersedia</span>
                  </div>
                </div>
                
                {/* File Info */}
                <div className="mt-1 text-xs text-gray-600">
                  <p className="truncate" title={file.fileName}>{file.fileName}</p>
                  <p>{formatFileSize(file.fileSize)}</p>
                  {/* Debug info - hapus setelah testing */}
                  <p className="text-gray-400 text-xs truncate" title={file.publicUrl}>
                    {file.publicUrl ? 'URL: OK' : 'URL: Missing'}
                  </p>
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Hapus foto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoUpload 