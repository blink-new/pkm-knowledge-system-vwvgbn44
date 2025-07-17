import { useState, useRef, useEffect } from 'react'
import { Search, Database, Zap, History, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SQLSearchBarProps {
  onSearch: (query: string, sqlQuery?: string) => void
  placeholder?: string
}

interface SearchSuggestion {
  type: 'field' | 'operator' | 'value' | 'function'
  text: string
  description: string
}

const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  // Fields
  { type: 'field', text: 'title:', description: 'Search in title field' },
  { type: 'field', text: 'content:', description: 'Search in content field' },
  { type: 'field', text: 'tags:', description: 'Search in tags' },
  { type: 'field', text: 'type:', description: 'Filter by content type' },
  { type: 'field', text: 'created:', description: 'Filter by creation date' },
  { type: 'field', text: 'updated:', description: 'Filter by update date' },
  
  // Operators
  { type: 'operator', text: 'AND', description: 'Logical AND operator' },
  { type: 'operator', text: 'OR', description: 'Logical OR operator' },
  { type: 'operator', text: 'NOT', description: 'Logical NOT operator' },
  { type: 'operator', text: '>', description: 'Greater than' },
  { type: 'operator', text: '<', description: 'Less than' },
  { type: 'operator', text: '>=', description: 'Greater than or equal' },
  { type: 'operator', text: '<=', description: 'Less than or equal' },
  { type: 'operator', text: '=', description: 'Equals' },
  { type: 'operator', text: '!=', description: 'Not equals' },
  { type: 'operator', text: 'LIKE', description: 'Pattern matching' },
  { type: 'operator', text: 'IN', description: 'Value in list' },
  
  // Functions
  { type: 'function', text: 'COUNT()', description: 'Count items' },
  { type: 'function', text: 'DATE()', description: 'Date function' },
  { type: 'function', text: 'LOWER()', description: 'Convert to lowercase' },
  { type: 'function', text: 'UPPER()', description: 'Convert to uppercase' },
  
  // Values
  { type: 'value', text: 'document', description: 'Document content type' },
  { type: 'value', text: 'image', description: 'Image content type' },
  { type: 'value', text: 'video', description: 'Video content type' },
  { type: 'value', text: 'note', description: 'Note content type' },
  { type: 'value', text: 'link', description: 'Link content type' },
]

const RECENT_SEARCHES = [
  'title:React AND tags:javascript',
  'type:document OR type:note',
  'created:>2024-01-01',
  'tags:design AND NOT type:video',
  'content:LIKE "%API%"'
]

const EXAMPLE_QUERIES = [
  {
    query: 'title:React AND tags:javascript',
    description: 'Find items with "React" in title and "javascript" tag'
  },
  {
    query: 'type:document OR type:note',
    description: 'Find all documents and notes'
  },
  {
    query: 'created:>2024-01-01',
    description: 'Find items created after January 1, 2024'
  },
  {
    query: 'tags:design AND NOT type:video',
    description: 'Find design-tagged items excluding videos'
  },
  {
    query: 'content:LIKE "%API%"',
    description: 'Find items containing "API" in content'
  }
]

export function SQLSearchBar({ onSearch, placeholder = "Search with SQL-like queries..." }: SQLSearchBarProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lastWord = query.split(/\s+/).pop() || ''
    if (lastWord.length > 0) {
      const filtered = SEARCH_SUGGESTIONS.filter(suggestion =>
        suggestion.text.toLowerCase().includes(lastWord.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
    setSelectedIndex(-1)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          applySuggestion(filteredSuggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const applySuggestion = (suggestion: SearchSuggestion) => {
    const words = query.split(/\s+/)
    words[words.length - 1] = suggestion.text
    const newQuery = words.join(' ') + (suggestion.type === 'field' ? '' : ' ')
    setQuery(newQuery)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, convertToSQL(query))
      setShowSuggestions(false)
    }
  }

  const convertToSQL = (searchQuery: string): string => {
    // Simple conversion logic - in a real app, this would be more sophisticated
    let sql = 'SELECT * FROM content_items WHERE '
    
    // Handle basic field:value patterns
    const fieldMatches = searchQuery.match(/(\w+):([^\s]+)/g)
    if (fieldMatches) {
      const conditions = fieldMatches.map(match => {
        const [field, value] = match.split(':')
        if (field === 'type') {
          return `contentType = '${value}'`
        } else if (field === 'tags') {
          return `tags LIKE '%${value}%'`
        } else if (field === 'created' || field === 'updated') {
          return `${field}At ${value.replace(/[<>=!]/g, '')} '${value.replace(/[<>=!]/g, '')}'`
        } else {
          return `${field} LIKE '%${value}%'`
        }
      })
      sql += conditions.join(' AND ')
    } else {
      // Full-text search
      sql += `(title LIKE '%${searchQuery}%' OR content LIKE '%${searchQuery}%' OR tags LIKE '%${searchQuery}%')`
    }
    
    sql += ' ORDER BY updatedAt DESC'
    return sql
  }

  const clearQuery = () => {
    setQuery('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const toggleAdvancedMode = () => {
    setIsAdvancedMode(!isAdvancedMode)
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length > 0 && setShowSuggestions(true)}
              placeholder={placeholder}
              className="pl-10 pr-20"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearQuery}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAdvancedMode}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              title="Toggle SQL mode"
            >
              <Database className={`h-3 w-3 ${isAdvancedMode ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
          </div>
          <Button onClick={handleSearch} className="ml-2">
            <Zap className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Advanced Mode Indicator */}
        {isAdvancedMode && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              SQL Mode Active
            </Badge>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              <div className="p-2">
                {filteredSuggestions.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                      Suggestions
                    </div>
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion.type}-${suggestion.text}`}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                          index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                        }`}
                        onClick={() => applySuggestion(suggestion)}
                      >
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              suggestion.type === 'field' ? 'border-blue-500 text-blue-600' :
                              suggestion.type === 'operator' ? 'border-green-500 text-green-600' :
                              suggestion.type === 'function' ? 'border-purple-500 text-purple-600' :
                              'border-orange-500 text-orange-600'
                            }`}
                          >
                            {suggestion.type}
                          </Badge>
                          <span className="font-mono text-sm">{suggestion.text}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {suggestion.description}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Advanced Mode Panel */}
      {isAdvancedMode && !showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-40 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Recent Searches */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Recent Searches</span>
                </div>
                <div className="space-y-1">
                  {RECENT_SEARCHES.map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start font-mono text-xs"
                      onClick={() => setQuery(search)}
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Example Queries */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Example Queries</span>
                </div>
                <div className="space-y-2">
                  {EXAMPLE_QUERIES.map((example, index) => (
                    <div key={index} className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start font-mono text-xs"
                        onClick={() => setQuery(example.query)}
                      >
                        {example.query}
                      </Button>
                      <p className="text-xs text-muted-foreground px-2">
                        {example.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}