import { useState } from 'react'
import { Search, Plus, FolderOpen, Settings, Database, FileText, Image, Video, Link, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AppLayoutProps {
  children: React.ReactNode
  onSearch?: (query: string) => void
  onFilterChange?: (filters: any) => void
}

export function AppLayout({ children, onSearch, onFilterChange }: AppLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const contentTypes = [
    { id: 'all', label: 'All Items', icon: Database, count: 0 },
    { id: 'document', label: 'Documents', icon: FileText, count: 0 },
    { id: 'image', label: 'Images', icon: Image, count: 0 },
    { id: 'video', label: 'Videos', icon: Video, count: 0 },
    { id: 'note', label: 'Notes', icon: StickyNote, count: 0 },
    { id: 'link', label: 'Links', icon: Link, count: 0 },
  ]

  const collections = [
    { id: '1', name: 'Research Papers', color: '#2563eb', count: 0 },
    { id: '2', name: 'Design Resources', color: '#7c3aed', count: 0 },
    { id: '3', name: 'Meeting Notes', color: '#059669', count: 0 },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId)
    onFilterChange?.({ contentType: filterId === 'all' ? undefined : filterId })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-foreground mb-4">Knowledge Base</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Quick Actions */}
            <div>
              <Button className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </div>

            {/* Content Types */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Content Types</h3>
              <div className="space-y-1">
                {contentTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.id}
                      variant={activeFilter === type.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => handleFilterClick(type.id)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <span className="flex-1 text-left">{type.label}</span>
                      <Badge variant="secondary" className="ml-2">
                        {type.count}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Collections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Collections</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {collections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: collection.color }}
                    />
                    <span className="flex-1 text-left">{collection.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {collection.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}