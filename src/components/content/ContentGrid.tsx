import { useState } from 'react'
import { MoreHorizontal, FileText, Image, Video, Link, StickyNote, Calendar, Tag, ExternalLink, Grid, List } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ContentItem, SearchFilters } from '@/types'
import { SearchParser } from '@/lib/searchParser'
import { AdvancedFilters } from '@/components/search/AdvancedFilters'

interface ContentGridProps {
  items: ContentItem[]
  onItemClick?: (item: ContentItem) => void
  onItemEdit?: (item: ContentItem) => void
  onItemDelete?: (item: ContentItem) => void
  searchQuery?: string
  filters?: SearchFilters
  onFiltersChange?: (filters: SearchFilters) => void
  onSortChange?: (sort: { field: string; direction: 'asc' | 'desc' }) => void
}

export function ContentGrid({ 
  items, 
  onItemClick, 
  onItemEdit, 
  onItemDelete, 
  searchQuery,
  filters = {},
  onFiltersChange,
  onSortChange
}: ContentGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentSort, setCurrentSort] = useState({ field: 'updatedAt', direction: 'desc' as 'asc' | 'desc' })

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText
      case 'image': return Image
      case 'video': return Video
      case 'link': return Link
      case 'note': return StickyNote
      default: return FileText
    }
  }

  const getContentPreview = (item: ContentItem) => {
    if (item.contentType === 'image' && item.fileUrl) {
      return (
        <div className="w-full h-32 bg-muted rounded-md overflow-hidden">
          <img 
            src={item.fileUrl} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )
    }
    
    if (item.content) {
      return (
        <div className="text-sm text-muted-foreground line-clamp-3">
          {item.content.substring(0, 150)}...
        </div>
      )
    }
    
    return (
      <div className="text-sm text-muted-foreground italic">
        No preview available
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const highlightText = (text: string) => {
    if (!searchQuery) return text
    const highlighted = SearchParser.highlight(text, searchQuery)
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
  }

  const handleSortChange = (sort: { field: string; direction: 'asc' | 'desc' }) => {
    setCurrentSort(sort)
    onSortChange?.(sort)
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    onFiltersChange?.(newFilters)
  }

  // Get available tags from all items
  const availableTags = [...new Set(items.flatMap(item => item.tags))]

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No content yet</h3>
          <p className="text-muted-foreground mb-4">Start building your knowledge base by adding your first item.</p>
          <Button>Add Content</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">All Content</h2>
          <p className="text-muted-foreground">{items.length} items in your knowledge base</p>
        </div>
        <div className="flex items-center gap-2">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSortChange={handleSortChange}
            currentSort={currentSort}
            availableTags={availableTags}
          />
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = getContentIcon(item.contentType)
          
          return (
            <Card 
              key={item.id} 
              className="content-card cursor-pointer"
              onClick={() => onItemClick?.(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <Badge variant="secondary" className="text-xs">
                      {item.contentType}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onItemEdit?.(item)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onItemDelete?.(item)}>
                        Delete
                      </DropdownMenuItem>
                      {item.fileUrl && (
                        <DropdownMenuItem onClick={() => window.open(item.fileUrl, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-medium line-clamp-2">{highlightText(item.title)}</h3>
              </CardHeader>
              
              <CardContent className="pt-0">
                {getContentPreview(item)}
                
                <div className="mt-4 space-y-2">
                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Date */}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(item.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}