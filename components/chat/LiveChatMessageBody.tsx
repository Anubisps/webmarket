'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { normalizeLiveChatAttachmentUrl } from '@/lib/livechatUrls'

interface LiveChatMessage {
  message: string
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentMime?: string | null
}

export function LiveChatMessageBody({ msg }: { msg: LiveChatMessage }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const isPdf = msg.attachmentMime === 'application/pdf'
  const attachmentSrc = msg.attachmentUrl
    ? normalizeLiveChatAttachmentUrl(msg.attachmentUrl)
    : null

  return (
    <>
      <div className="space-y-2">
        {attachmentSrc && (
          isPdf ? (
            <a
              href={attachmentSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-xs underline hover:bg-black/30"
            >
              PDF: {msg.attachmentName || 'Document'}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setPreviewUrl(attachmentSrc)}
              className="block text-left"
            >
              <img
                src={attachmentSrc}
                alt={msg.attachmentName || 'Attachment'}
                className="max-h-48 max-w-full rounded-lg border border-white/10 cursor-zoom-in hover:opacity-90 transition-opacity"
              />
            </button>
          )
        )}
        {msg.message ? (
          <span className="whitespace-pre-wrap break-words">{msg.message}</span>
        ) : null}
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={previewUrl}
            alt={msg.attachmentName || 'Attachment preview'}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
