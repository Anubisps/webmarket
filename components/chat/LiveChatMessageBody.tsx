interface LiveChatMessage {
  message: string
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentMime?: string | null
}

export function LiveChatMessageBody({ msg }: { msg: LiveChatMessage }) {
  const isPdf = msg.attachmentMime === 'application/pdf'

  return (
    <div className="space-y-2">
      {msg.attachmentUrl && (
        isPdf ? (
          <a
            href={msg.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-xs underline hover:bg-black/30"
          >
            PDF: {msg.attachmentName || 'Document'}
          </a>
        ) : (
          <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={msg.attachmentUrl}
              alt={msg.attachmentName || 'Attachment'}
              className="max-h-48 max-w-full rounded-lg border border-white/10"
            />
          </a>
        )
      )}
      {msg.message ? <span className="whitespace-pre-wrap break-words">{msg.message}</span> : null}
    </div>
  )
}
