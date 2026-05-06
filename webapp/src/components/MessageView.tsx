import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../types/chat'

type MessageViewProps = {
  message: Message
}

export function MessageView({ message }: MessageViewProps) {
  const [expanded, setExpanded] = useState(false)
  const canCollapse = message.role === 'user' && message.text.length > 350
  const shouldCollapse = canCollapse && !expanded

  return (
    <div
      className={message.role === 'user' ? 'msg msg-user' : 'msg msg-assistant'}
      data-message-id={message.id}
    >
      {message.role === 'assistant' ? (
        <div className="msg-content markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
        </div>
      ) : (
        <div className={shouldCollapse ? 'msg-content collapsed' : 'msg-content'}>{message.text}</div>
      )}

      {shouldCollapse && <div className="fade-user" />}

      {canCollapse && (
        <button type="button" className="toggle-btn" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
