import { Search, Clock, Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SearchResultsProps {
  query: string
  totalResults: number
  searchTime?: number
  onClearSearch: () => void
  filters?: {
    contentType?: string
    tags?: string[]
    dateRange?: string
  }
}

export function SearchResults({ 
  query, 
  totalResults, 
  searchTime, 
  onClearSearch,
  filters 
}: SearchResultsProps) {
  if (!query) return null

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Search Results</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{totalResults.toLocaleString()} items found</span>
              {searchTime && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{searchTime}ms</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearSearch}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>

        {/* Query Display */}
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Query:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              {query}
            </code>
          </div>

          {/* Active Filters */}
          {(filters?.contentType || filters?.tags?.length || filters?.dateRange) && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Filters:</span>
              
              {filters.contentType && (
                <Badge variant="secondary" className="text-xs">
                  Type: {filters.contentType}
                </Badge>
              )}
              
              {filters.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  Tag: {tag}
                </Badge>
              ))}
              
              {filters.dateRange && (
                <Badge variant="secondary" className="text-xs">
                  Date: {filters.dateRange}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* No Results Message */}
        {totalResults === 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium mb-1">No results found</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Try adjusting your search query or filters
              </p>
              <div className="text-xs text-muted-foreground">
                <p className="mb-1">Search tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use <code className="bg-background px-1 rounded">type:document</code> to filter by content type</li>
                  <li>Use <code className="bg-background px-1 rounded">tags:react</code> to search by tags</li>
                  <li>Use <code className="bg-background px-1 rounded">title:"exact phrase"</code> for exact matches</li>
                  <li>Combine with <code className="bg-background px-1 rounded">AND</code>, <code className="bg-background px-1 rounded">OR</code>, <code className="bg-background px-1 rounded">NOT</code></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}