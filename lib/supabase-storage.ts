"use client"

import { supabase } from './supabase-client'

const BUCKET_NAME = 'card-images'

export interface UploadImageOptions {
  userId: string
  cardId: string
  file: File | Blob
  type?: 'background' | 'export'
}

export interface UploadImageResult {
  path: string
  publicUrl: string
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadCardImage(
  options: UploadImageOptions
): Promise<UploadImageResult> {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  const { userId, cardId, file, type = 'background' } = options

  // Generate file path: userId/cardId_type.ext
  const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg'
  const fileName = `${cardId}_${type}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      upsert: true, // Replace if exists
      contentType: file.type || 'image/jpeg',
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteCardImage(filePath: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    console.error('Delete error:', error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

/**
 * Get public URL for an image
 */
export function getCardImageUrl(filePath: string): string {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Upload image from URL (for AI-generated images)
 */
export async function uploadImageFromUrl(
  url: string,
  userId: string,
  cardId: string,
  type: 'background' | 'export' = 'background'
): Promise<UploadImageResult> {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  try {
    // Fetch image from URL
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const blob = await response.blob()

    // Upload to Supabase
    return await uploadCardImage({
      userId,
      cardId,
      file: blob,
      type,
    })
  } catch (error) {
    console.error('Upload from URL error:', error)
    throw error
  }
}

/**
 * Convert canvas to blob and upload
 */
export async function uploadCanvasAsImage(
  canvas: HTMLCanvasElement,
  userId: string,
  cardId: string,
  type: 'export' = 'export'
): Promise<UploadImageResult> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to convert canvas to blob'))
        return
      }

      try {
        const result = await uploadCardImage({
          userId,
          cardId,
          file: blob,
          type,
        })
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }, 'image/png')
  })
}

/**
 * List all images for a user
 */
export async function listUserImages(userId: string) {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(userId)

  if (error) {
    console.error('List error:', error)
    throw new Error(`Failed to list images: ${error.message}`)
  }

  return data
}
