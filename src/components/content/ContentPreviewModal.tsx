import { useState } from 'react'
import { X, ExternalLink, Edit, Trash2, Download, Share, Calendar, Tag, FileText, Image, Video, Link, StickyNote } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContentItem } from '@/types'

interface ContentPreviewModalProps {
  item: ContentItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (item: ContentItem) => void
  onDelete?: (item: ContentItem) => void
}

export function ContentPreviewModal({ item, open, onOpenChange, onEdit, onDelete }: ContentPreviewModalProps) {
  const [imageError, setImageError] = useState(false)

  if (!item) return null

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderContent = () => {
    switch (item.contentType) {
      case 'image':
        if (item.fileUrl && !imageError) {
          return (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted">
                <img
                  src={item.fileUrl}
                  alt={item.title}
                  className="w-full max-h-96 object-contain"
                  onError={() => setImageError(true)}
                />
              </div>
              {item.content && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">{item.content}</p>
                </div>
              )}
            </div>
          )
        }
        return (
          <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
            <div className="text-center">
              <Image className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Image not available</p>
            </div>
          </div>
        )

      case 'video':
        if (item.fileUrl) {
          return (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted">
                <video
                  controls
                  className="w-full max-h-96"
                  preload="metadata"
                >
                  <source src={item.fileUrl} />
                  Your browser does not support the video tag.
                </video>
              </div>
              {item.content && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">{item.content}</p>
                </div>
              )}
            </div>
          )
        }
        return (
          <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Video not available</p>
            </div>
          </div>
        )

      case 'link':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                <a
                  href={item.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  {item.content}
                </a>
              </div>
              {item.content && item.content !== item.title && (
                <p className="text-sm text-muted-foreground">{item.content}</p>
              )}
            </div>
          </div>
        )

      case 'document':
        return (
          <div className="space-y-4">
            {item.fileUrl && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">Document File</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.fileUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>
            )}
            {item.content && (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-foreground">
                  {item.content}
                </div>
              </div>
            )}
          </div>
        )

      case 'note':
      default:
        return (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-foreground">
              {item.content || 'No content available'}
            </div>
          </div>
        )
    }
  }

  const Icon = getContentIcon(item.contentType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-xl">{item.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {item.contentType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Created {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(item)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(item)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Content */}
            <div>
              {renderContent()}
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              {/* Tags */}
              {item.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Created</div>
                    <div className="text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Updated</div>
                    <div className="text-muted-foreground">
                      {formatDate(item.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* File Info */}
              {item.fileUrl && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">File Information</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">URL:</span>
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline max-w-xs truncate"
                      >
                        {item.fileUrl}
                      </a>
                    </div>
                    {item.fileSize && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                    {item.mimeType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{item.mimeType}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex justify-between">
            <div className="flex gap-2">
              {item.fileUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(item.fileUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open File
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}