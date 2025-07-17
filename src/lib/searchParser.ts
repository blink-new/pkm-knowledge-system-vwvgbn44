import { ContentItem } from '@/types'

export interface ParsedQuery {
  fields: Record<string, string | string[]>
  operators: string[]
  fullText?: string
  dateFilters?: {
    field: 'created' | 'updated'
    operator: '>' | '<' | '>=' | '<=' | '='
    value: string
  }[]
}

export class SearchParser {
  static parse(query: string): ParsedQuery {
    const result: ParsedQuery = {
      fields: {},
      operators: [],
      dateFilters: []
    }

    // Remove extra whitespace and normalize
    const normalizedQuery = query.trim().replace(/\s+/g, ' ')

    // Extract field:value patterns
    const fieldMatches = normalizedQuery.match(/(\w+):\s*([^\s]+(?:\s+[^\s:]+)*?)(?=\s+\w+:|$)/g)
    
    if (fieldMatches) {
      fieldMatches.forEach(match => {
        const colonIndex = match.indexOf(':')
        const field = match.substring(0, colonIndex).trim()
        let value = match.substring(colonIndex + 1).trim()

        // Remove quotes if present
        value = value.replace(/^["']|["']$/g, '')

        // Handle special cases
        if (field === 'created' || field === 'updated') {
          const dateMatch = value.match(/([><=!]+)(.+)/)
          if (dateMatch) {
            result.dateFilters?.push({
              field: field as 'created' | 'updated',
              operator: dateMatch[1] as any,
              value: dateMatch[2].trim()
            })
          }
        } else if (field === 'tags') {
          // Handle multiple tags
          if (value.includes(',')) {
            result.fields[field] = value.split(',').map(t => t.trim())
          } else {
            result.fields[field] = value
          }
        } else {
          result.fields[field] = value
        }
      })

      // Remove field patterns from query to get remaining text
      let remainingQuery = normalizedQuery
      fieldMatches.forEach(match => {
        remainingQuery = remainingQuery.replace(match, '')
      })

      // Extract operators
      const operatorMatches = remainingQuery.match(/\b(AND|OR|NOT)\b/gi)
      if (operatorMatches) {
        result.operators = operatorMatches.map(op => op.toUpperCase())
        remainingQuery = remainingQuery.replace(/\b(AND|OR|NOT)\b/gi, '').trim()
      }

      // Remaining text is full-text search
      if (remainingQuery.trim()) {
        result.fullText = remainingQuery.trim()
      }
    } else {
      // No field patterns, treat as full-text search
      result.fullText = normalizedQuery
    }

    return result
  }

  static filter(items: ContentItem[], parsedQuery: ParsedQuery): ContentItem[] {
    return items.filter(item => {
      let matches = true

      // Check field filters
      Object.entries(parsedQuery.fields).forEach(([field, value]) => {
        switch (field) {
          case 'title':
            if (typeof value === 'string') {
              matches = matches && item.title.toLowerCase().includes(value.toLowerCase())
            }
            break
          case 'content':
            if (typeof value === 'string' && item.content) {
              matches = matches && item.content.toLowerCase().includes(value.toLowerCase())
            }
            break
          case 'type':
            if (typeof value === 'string') {
              matches = matches && item.contentType === value
            }
            break
          case 'tags':
            if (typeof value === 'string') {
              matches = matches && item.tags.some(tag => 
                tag.toLowerCase().includes(value.toLowerCase())
              )
            } else if (Array.isArray(value)) {
              matches = matches && value.some(v => 
                item.tags.some(tag => tag.toLowerCase().includes(v.toLowerCase()))
              )
            }
            break
        }
      })

      // Check date filters
      parsedQuery.dateFilters?.forEach(dateFilter => {
        const itemDate = new Date(
          dateFilter.field === 'created' ? item.createdAt : item.updatedAt
        )
        const filterDate = new Date(dateFilter.value)

        switch (dateFilter.operator) {
          case '>':
            matches = matches && itemDate > filterDate
            break
          case '<':
            matches = matches && itemDate < filterDate
            break
          case '>=':
            matches = matches && itemDate >= filterDate
            break
          case '<=':
            matches = matches && itemDate <= filterDate
            break
          case '=':
            matches = matches && itemDate.toDateString() === filterDate.toDateString()
            break
        }
      })

      // Check full-text search
      if (parsedQuery.fullText) {
        const searchText = parsedQuery.fullText.toLowerCase()
        const fullTextMatch = 
          item.title.toLowerCase().includes(searchText) ||
          (item.content && item.content.toLowerCase().includes(searchText)) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchText))
        
        matches = matches && fullTextMatch
      }

      return matches
    })
  }

  static highlight(text: string, query: string): string {
    if (!query) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  }

  static getSuggestions(query: string, items: ContentItem[]): string[] {
    const suggestions: string[] = []
    const lastWord = query.split(/\s+/).pop()?.toLowerCase() || ''

    if (lastWord.length < 2) return suggestions

    // Get unique values from items
    const uniqueTitles = [...new Set(items.map(item => item.title))]
    const uniqueTags = [...new Set(items.flatMap(item => item.tags))]
    const uniqueTypes = [...new Set(items.map(item => item.contentType))]

    // Title suggestions
    uniqueTitles.forEach(title => {
      if (title.toLowerCase().includes(lastWord)) {
        suggestions.push(`title:"${title}"`)
      }
    })

    // Tag suggestions
    uniqueTags.forEach(tag => {
      if (tag.toLowerCase().includes(lastWord)) {
        suggestions.push(`tags:${tag}`)
      }
    })

    // Type suggestions
    uniqueTypes.forEach(type => {
      if (type.toLowerCase().includes(lastWord)) {
        suggestions.push(`type:${type}`)
      }
    })

    return suggestions.slice(0, 10)
  }

  static validateQuery(query: string): { isValid: boolean; error?: string } {
    try {
      // Basic validation
      if (!query.trim()) {
        return { isValid: false, error: 'Query cannot be empty' }
      }

      // Check for balanced quotes
      const quotes = query.match(/"/g)
      if (quotes && quotes.length % 2 !== 0) {
        return { isValid: false, error: 'Unmatched quotes in query' }
      }

      // Check for valid field names
      const fieldMatches = query.match(/(\w+):/g)
      if (fieldMatches) {
        const validFields = ['title', 'content', 'tags', 'type', 'created', 'updated']
        const invalidFields = fieldMatches
          .map(match => match.replace(':', ''))
          .filter(field => !validFields.includes(field))
        
        if (invalidFields.length > 0) {
          return { 
            isValid: false, 
            error: `Invalid field(s): ${invalidFields.join(', ')}. Valid fields: ${validFields.join(', ')}` 
          }
        }
      }

      return { isValid: true }
    } catch (error) {
      return { isValid: false, error: 'Invalid query syntax' }
    }
  }
}