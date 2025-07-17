import { useState } from 'react'
import { Filter, Calendar, Tag, FileType, SortAsc, SortDesc, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SearchFilters } from '@/types'

interface AdvancedFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSortChange: (sort: { field: string; direction: 'asc' | 'desc' }) => void
  currentSort: { field: string; direction: 'asc' | 'desc' }
  availableTags: string[]
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onSortChange, 
  currentSort, 
  availableTags 
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const contentTypes = [
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'note', label: 'Notes' },
    { value: 'link', label: 'Links' },
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'title', label: 'Title' },
    { value: 'contentType', label: 'Type' },
  ]

  const handleContentTypeChange = (type: string) => {
    const currentTypes = filters.contentType || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    
    onFiltersChange({
      ...filters,
      contentType: newTypes.length > 0 ? newTypes : undefined
    })
  }

  const handleTagAdd = (tag: string) => {
    if (!tag.trim()) return
    
    const currentTags = filters.tags || []
    if (!currentTags.includes(tag)) {
      onFiltersChange({
        ...filters,
        tags: [...currentTags, tag]
      })
    }
    setTagInput('')
  }

  const handleTagRemove = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.filter(t => t !== tag)
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    })
  }

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | undefined) => {
    if (!date) return
    
    const currentRange = filters.dateRange || { start: '', end: '' }
    const newRange = {
      ...currentRange,
      [field]: date.toISOString()
    }
    
    onFiltersChange({
      ...filters,
      dateRange: newRange
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.contentType?.length) count++
    if (filters.tags?.length) count++
    if (filters.dateRange?.start || filters.dateRange?.end) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="flex items-center gap-2">
      {/* Sort Controls */}
      <Select
        value={currentSort.field}
        onValueChange={(field) => onSortChange({ ...currentSort, field })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortChange({ 
          ...currentSort, 
          direction: currentSort.direction === 'asc' ? 'desc' : 'asc' 
        })}
      >
        {currentSort.direction === 'asc' ? (
          <SortAsc className="h-4 w-4" />
        ) : (
          <SortDesc className="h-4 w-4" />
        )}
      </Button>

      {/* Advanced Filters */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Advanced Filters</CardTitle>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Types */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Content Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={filters.contentType?.includes(type.value) ? "default" : "outline"}
                      size="sm"
                      className="justify-start text-xs"
                      onClick={() => handleContentTypeChange(type.value)}
                    >
                      <FileType className="h-3 w-3 mr-2" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Tags */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Tags</Label>
                
                {/* Selected Tags */}
                {filters.tags && filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {filters.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => handleTagRemove(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag..."
                    className="text-xs"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleTagAdd(tagInput)
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleTagAdd(tagInput)}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>

                {/* Available Tags */}
                {availableTags.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Available tags:</div>
                    <div className="flex flex-wrap gap-1">
                      {availableTags
                        .filter(tag => !filters.tags?.includes(tag))
                        .slice(0, 10)
                        .map((tag) => (
                          <Button
                            key={tag}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleTagAdd(tag)}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Date Range */}
              <div>
                <Label className="text-xs font-medium mb-2 block">Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                        >
                          <Calendar className="h-3 w-3 mr-2" />
                          {filters.dateRange?.start 
                            ? new Date(filters.dateRange.start).toLocaleDateString()
                            : 'Select date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateRange?.start ? new Date(filters.dateRange.start) : undefined}
                          onSelect={(date) => handleDateRangeChange('start', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                        >
                          <Calendar className="h-3 w-3 mr-2" />
                          {filters.dateRange?.end 
                            ? new Date(filters.dateRange.end).toLocaleDateString()
                            : 'Select date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateRange?.end ? new Date(filters.dateRange.end) : undefined}
                          onSelect={(date) => handleDateRangeChange('end', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  )
}