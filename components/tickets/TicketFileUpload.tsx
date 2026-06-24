'use client'
import { useRef, useState } from 'react'
import { FileText, ImageIcon, Paperclip, Upload, X } from 'lucide-react'

const MAX_FILES = 5
const MAX_SIZE = 10 * 1024 * 1024
const ACCEPT = 'image/*,.pdf,.png,.jpg,.jpeg,.webp,.gif'

type TicketFileUploadProps = {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

export function TicketFileUpload({ files, onChange, disabled }: TicketFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files]
    for (const file of Array.from(incoming)) {
      if (next.length >= MAX_FILES) break
      if (file.size > MAX_SIZE) continue
      if (next.some(f => f.name === file.name && f.size === file.size)) continue
      next.push(file)
    }
    onChange(next)
  }

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          if (!disabled && e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
        }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          dragOver
            ? 'border-violet-400 bg-violet-500/10'
            : 'border-white/10 bg-black/20 hover:border-violet-500/40 hover:bg-violet-500/5'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <Upload className="mx-auto mb-2 h-8 w-8 text-violet-400" />
        <p className="font-medium text-white">Drop images or files here</p>
        <p className="mt-1 text-sm text-gray-400">
          PNG, JPG, GIF, WEBP, PDF — up to {MAX_FILES} files, 10MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          disabled={disabled}
          onChange={e => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {files.map((file, i) => {
            const isImage = file.type.startsWith('image/')
            return (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                  {isImage ? <ImageIcon className="h-5 w-5 text-violet-300" /> : <FileText className="h-5 w-5 text-cyan-300" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  disabled={disabled}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-500/20 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <p className="flex items-center gap-1 text-xs text-gray-500">
        <Paperclip className="h-3 w-3" />
        Attach screenshots to help us resolve your issue faster.
      </p>
    </div>
  )
}

export async function uploadTicketFiles(ticketId: string, files: File[]) {
  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error('Failed to upload attachment')
  }
}
