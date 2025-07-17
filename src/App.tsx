import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ContentGrid } from '@/components/content/ContentGrid'
import { AddContentDialog } from '@/components/content/AddContentDialog'
import { ContentPreviewModal } from '@/components/content/ContentPreviewModal'
import { SearchResults } from '@/components/search/SearchResults'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { blink } from '@/blink/client'
import { ContentItem, SearchFilters } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { SearchParser } from '@/lib/searchParser'

// Mock data for demonstration
const mockItems: ContentItem[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'React Best Practices',
      contentType: 'note',
      content: 'Here are some important React best practices to follow when building applications...',
      tags: ['react', 'javascript', 'frontend'],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Design System Documentation',
      contentType: 'document',
      content: 'Complete guide to our design system including colors, typography, and components.',
      fileUrl: 'https://example.com/design-system.pdf',
      tags: ['design', 'documentation', 'ui'],
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      userId: 'user1',
      title: 'Architecture Diagram',
      contentType: 'image',
      content: 'System architecture overview showing microservices and data flow.',
      fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      tags: ['architecture', 'system', 'diagram'],
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-13T09:15:00Z'
    },
    {
      id: '4',
      userId: 'user1',
      title: 'Team Meeting Recording',
      contentType: 'video',
      content: 'Weekly team sync discussing project progress and next steps.',
      fileUrl: 'https://example.com/meeting.mp4',
      tags: ['meeting', 'team', 'sync'],
      createdAt: '2024-01-12T16:00:00Z',
      updatedAt: '2024-01-12T16:00:00Z'
    },
    {
      id: '5',
      userId: 'user1',
      title: 'Useful Development Resources',
      contentType: 'link',
      content: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      tags: ['resources', 'javascript', 'learning'],
      createdAt: '2024-01-11T11:45:00Z',
      updatedAt: '2024-01-11T11:45:00Z'
    }
  ]

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [sortConfig, setSortConfig] = useState({ field: 'updatedAt', direction: 'desc' as 'asc' | 'desc' })

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      // For now, use mock data
      setContentItems(mockItems)
      setFilteredItems(mockItems)
    }
  }, [user])

  useEffect(() => {
    let filtered = [...contentItems]

    // Apply search query
    if (searchQuery.trim()) {
      const parsedQuery = SearchParser.parse(searchQuery)
      filtered = SearchParser.filter(filtered, parsedQuery)
    }

    // Apply filters
    if (filters.contentType?.length) {
      filtered = filtered.filter(item => filters.contentType!.includes(item.contentType))
    }

    if (filters.tags?.length) {
      filtered = filtered.filter(item => 
        filters.tags!.some(filterTag => 
          item.tags.some(itemTag => itemTag.toLowerCase().includes(filterTag.toLowerCase()))
        )
      )
    }

    if (filters.dateRange?.start) {
      const startDate = new Date(filters.dateRange.start)
      filtered = filtered.filter(item => new Date(item.createdAt) >= startDate)
    }

    if (filters.dateRange?.end) {
      const endDate = new Date(filters.dateRange.end)
      filtered = filtered.filter(item => new Date(item.createdAt) <= endDate)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.field as keyof ContentItem]
      let bValue: any = b[sortConfig.field as keyof ContentItem]

      // Handle date fields
      if (sortConfig.field === 'createdAt' || sortConfig.field === 'updatedAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredItems(filtered)
  }, [searchQuery, contentItems, filters, sortConfig])

  const handleSearch = (query: string, sqlQuery?: string) => {
    setSearchQuery(query)
    
    if (query.trim()) {
      // Parse and execute SQL-like query
      const parsedQuery = SearchParser.parse(query)
      const filtered = SearchParser.filter(contentItems, parsedQuery)
      setFilteredItems(filtered)
      
      // Show query info
      if (sqlQuery) {
        console.log('SQL Query:', sqlQuery)
        toast.success(`Found ${filtered.length} items matching your query`)
      }
    } else {
      setFilteredItems(contentItems)
    }
  }

  const handleFilterChange = (filters: any) => {
    let filtered = contentItems

    if (filters.contentType) {
      filtered = filtered.filter(item => item.contentType === filters.contentType)
    }

    setFilteredItems(filtered)
  }

  const handleAddContent = async (data: any) => {
    try {
      let fileUrl = null
      
      // Upload file if present
      if (data.file) {
        const { publicUrl } = await blink.storage.upload(
          data.file,
          `content/${Date.now()}-${data.file.name}`,
          { upsert: true }
        )
        fileUrl = publicUrl
      }

      // Create new content item
      const newItem: ContentItem = {
        id: Date.now().toString(),
        userId: user?.id || 'user1',
        title: data.title,
        contentType: data.contentType,
        content: data.content,
        fileUrl,
        tags: data.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add to local state (in real app, this would save to database)
      setContentItems(prev => [newItem, ...prev])
      
      toast.success('Content added successfully!')
    } catch (error) {
      console.error('Error adding content:', error)
      toast.error('Failed to add content')
    }
  }

  const handleItemClick = (item: ContentItem) => {
    setPreviewItem(item)
    setPreviewOpen(true)
  }

  const handleItemEdit = (item: ContentItem) => {
    // TODO: Open edit dialog
    console.log('Edit item:', item)
  }

  const handleItemDelete = (item: ContentItem) => {
    // TODO: Confirm and delete item
    setContentItems(prev => prev.filter(i => i.id !== item.id))
    toast.success('Content deleted')
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const handleSortChange = (sort: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sort)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your knowledge base...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Knowledge Base</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your personal knowledge management system.</p>
          <Button onClick={() => blink.auth.login()}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="pkm-theme">
      <div className="min-h-screen bg-background">
        <AppLayout onSearch={handleSearch} onFilterChange={handleFilterChange}>
          <div className="flex-1 flex flex-col">
            {/* Header with Add Button */}
            <div className="border-b bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold">Welcome back, {user.email}</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your knowledge base and find information quickly
                  </p>
                </div>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </div>
            </div>

            {/* Search Results Summary */}
            {searchQuery && (
              <div className="px-6 pt-4">
                <SearchResults
                  query={searchQuery}
                  totalResults={filteredItems.length}
                  onClearSearch={() => handleSearch('')}
                />
              </div>
            )}

            {/* Content Area */}
            <ContentGrid
              items={filteredItems}
              onItemClick={handleItemClick}
              onItemEdit={handleItemEdit}
              onItemDelete={handleItemDelete}
              searchQuery={searchQuery}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSortChange={handleSortChange}
            />
          </div>
        </AppLayout>

        {/* Add Content Dialog */}
        <AddContentDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSubmit={handleAddContent}
        />

        {/* Content Preview Modal */}
        <ContentPreviewModal
          item={previewItem}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          onEdit={handleItemEdit}
          onDelete={handleItemDelete}
        />
      </div>
    </ThemeProvider>
  )
}

export default App