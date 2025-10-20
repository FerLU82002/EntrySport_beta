"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseImageUploadResult {
  uploading: boolean
  uploadImage: (file: File, userId: string) => Promise<string | null>
  deleteImage: (imageUrl: string) => Promise<boolean>
  error: string | null
}

export function useImageUpload(): UseImageUploadResult {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    setUploading(true)
    setError(null)

    try {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Usa JPG, PNG o WebP.')
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo es muy grande. Máximo 5MB.')
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Subir archivo a Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('establecimientos-fotos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Obtener URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('establecimientos-fotos')
        .getPublicUrl(fileName)

      setUploading(false)
      return publicUrl

    } catch (err: any) {
      console.error('Error uploading image:', err)
      setError(err.message || 'Error al subir la imagen')
      setUploading(false)
      return null
    }
  }

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extraer el path del archivo de la URL
      const urlParts = imageUrl.split('/establecimientos-fotos/')
      if (urlParts.length < 2) return false

      const filePath = urlParts[1]

      // Eliminar archivo de Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('establecimientos-fotos')
        .remove([filePath])

      if (deleteError) {
        throw deleteError
      }

      return true
    } catch (err: any) {
      console.error('Error deleting image:', err)
      setError(err.message || 'Error al eliminar la imagen')
      return false
    }
  }

  return { uploading, uploadImage, deleteImage, error }
}
