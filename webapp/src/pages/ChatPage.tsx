import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { MAX_TEXTAREA_HEIGHT, MIN_TEXTAREA_HEIGHT, SUGGESTIONS } from '../constants/chat'
import { ChatInput } from '../components/ChatInput'
import { MessageView } from '../components/MessageView'
import { Suggestions } from '../components/Suggestions'
import { sendChatMessage } from '../api/chat'
import type { Message } from '../types/chat'

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [sending, setSending] = useState(false)
  const [waitingForResponse, setWaitingForResponse] = useState(false)
  const [focusMessageId, setFocusMessageId] = useState<string | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const canSend = input.trim().length > 0
  const canClear = messages.length > 0 && !sending && !waitingForResponse

  const resizeInput = () => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    const nextHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)
    el.style.height = `${Math.max(nextHeight, MIN_TEXTAREA_HEIGHT)}px`
  }

  useEffect(() => {
    resizeInput()
  }, [input])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, waitingForResponse])

  useEffect(() => {
    if (!focusMessageId) return
    const target = document.querySelector(`[data-message-id="${focusMessageId}"]`)
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setFocusMessageId(null)
    }
  }, [messages, focusMessageId])

  const typeAssistantMessage = async (fullText: string) => {
    const messageId = crypto.randomUUID()
    setMessages((prev) => [...prev, { id: messageId, role: 'assistant', text: '' }])

    await new Promise<void>((resolve) => {
      let index = 0
      const chunk = 2
      const timer = window.setInterval(() => {
        index = Math.min(index + chunk, fullText.length)
        const nextText = fullText.slice(0, index)
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, text: nextText } : msg)),
        )

        if (index >= fullText.length) {
          window.clearInterval(timer)
          resolve()
        }
      }, 14)
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const message = input.trim()
    if (!message) return

    const userMessageId = crypto.randomUUID()
    setMessages((prev) => [...prev, { id: userMessageId, role: 'user', text: message }])
    setFocusMessageId(userMessageId)
    setInput('')
    setSending(true)
    setWaitingForResponse(true)
    setShowSuggestions(false)

    try {
      const assistantText = await sendChatMessage(message)
      setWaitingForResponse(false)
      await typeAssistantMessage(assistantText)
    } catch {
      setWaitingForResponse(false)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', text: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([])
    setInput('')
    setShowSuggestions(false)
    setFocusMessageId(null)
    inputRef.current?.focus()
  }

  return (
    <main className="page-wrap">
      <section className="chat-layout">
        <div id="chat" className="chat-list" ref={chatRef}>
          {showSuggestions && (
            <Suggestions
              items={SUGGESTIONS}
              onSelect={(value) => {
                setInput(value)
                inputRef.current?.focus()
              }}
            />
          )}

          {messages.map((msg) => (
            <MessageView key={msg.id} message={msg} />
          ))}

          {waitingForResponse && (
            <div className="msg msg-assistant thinking-bubble" aria-live="polite" aria-label="Generating response">
              <span className="thinking-dot"></span>
              <span className="thinking-dot"></span>
              <span className="thinking-dot"></span>
            </div>
          )}
        </div>

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={submit}
          onClear={clearChat}
          inputRef={inputRef}
          canSend={canSend}
          canClear={canClear}
          sending={sending}
        />
      </section>
    </main>
  )
}
