import type { FormEvent, KeyboardEvent, RefObject } from 'react'

type ChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
  onClear: () => void
  inputRef: RefObject<HTMLTextAreaElement | null>
  canSend: boolean
  canClear: boolean
  sending: boolean
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onClear,
  inputRef,
  canSend,
  canClear,
  sending,
}: ChatInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && canSend && !sending) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form className="chat-form" onSubmit={onSubmit}>
      <div className="chat-form-actions">
        <button type="button" className="clear-btn" onClick={onClear} disabled={!canClear}>
          Clear chat
        </button>
      </div>
      <div className="input-wrap">
        <textarea
          ref={inputRef}
          id="message"
          name="message"
          rows={2}
          required
          placeholder="Type your question..."
          className="chat-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          id="send-btn"
          type="submit"
          className={`send-btn ${canSend ? 'show' : ''}`}
          aria-label="Send message"
          disabled={!canSend || sending}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
          </svg>
        </button>
      </div>
    </form>
  )
}
