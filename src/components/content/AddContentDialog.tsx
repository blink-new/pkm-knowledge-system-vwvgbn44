import { useState } from 'react'
import { Upload, FileText, Image, Video, Link, StickyNote, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AddContentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function AddContentDialog({ open, onOpenChange, onSubmit }: AddContentDialogProps) {
  const [contentType, setContentType] = useState<string>('note')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const contentTypes = [
    { id: 'note', label: 'Note', icon: StickyNote, description: 'Text-based notes and thoughts' },
    { id: 'document', label: 'Document', icon: FileText, description: 'PDF, Word, or text files' },
    { id: 'image', label: 'Image', icon: Image, description: 'Photos, screenshots, diagrams' },
    { id: 'video', label: 'Video', icon: Video, description: 'Video files and recordings' },
    { id: 'link', label: 'Link', icon: Link, description: 'Web pages and bookmarks' },
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      if (!title) {
        setTitle(e.dataTransfer.files[0].name)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      if (!title) {
        setTitle(e.target.files[0].name)
      }
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      title,
      contentType,
      content: contentType === 'link' ? url : content,
      file,
      tags,
    }
    
    onSubmit(data)
    
    // Reset form
    setTitle('')
    setContent('')
    setUrl('')
    setTags([])
    setFile(null)
    onOpenChange(false)
  }

  const selectedType = contentTypes.find(type => type.id === contentType)
  const Icon = selectedType?.icon || StickyNote

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Add New Content
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Content Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {contentTypes.map((type) => {
                const TypeIcon = type.icon
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-colors ${
                      contentType === type.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setContentType(type.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <TypeIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {type.description}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your content"
              required
            />
          </div>

          {/* Content based on type */}
          <Tabs value={contentType} className="w-full">
            <TabsContent value="note" className="space-y-4">
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={6}
                />
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-4">
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a description for this link..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="document" className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drop your document here, or{' '}
                    <label className="text-primary cursor-pointer hover:underline">
                      browse files
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, Word, and text files
                  </p>
                </div>
                {file && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Image className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drop your image here, or{' '}
                    <label className="text-primary cursor-pointer hover:underline">
                      browse files
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, GIF, and WebP
                  </p>
                </div>
                {file && (
                  <div className="mt-4">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="max-w-full max-h-32 mx-auto rounded-md"
                    />
                    <p className="text-sm font-medium mt-2">{file.name}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Video className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drop your video here, or{' '}
                    <label className="text-primary cursor-pointer hover:underline">
                      browse files
                      <input
                        type="file"
                        className="hidden"
                        accept="video/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports MP4, WebM, and MOV
                  </p>
                </div>
                {file && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Content
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}