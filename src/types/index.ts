export interface ContentItem {
  id: string
  userId: string
  title: string
  contentType: 'document' | 'image' | 'video' | 'note' | 'link'
  content?: string
  fileUrl?: string
  fileSize?: number
  mimeType?: string
  tags: string[]
  collectionId?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Collection {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface SearchFilters {
  contentType?: string[]
  tags?: string[]
  collectionId?: string
  dateRange?: {
    start: string
    end: string
  }
}