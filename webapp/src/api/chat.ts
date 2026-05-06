type ChatResponse = {
  message?: string
}

const SESSION_STORAGE_KEY = 'sliit-support-session-id'

function getSessionId(): string {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (existing) return existing

  const created = crypto.randomUUID()
  window.localStorage.setItem(SESSION_STORAGE_KEY, created)
  return created
}

export async function sendChatMessage(message: string): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      sessionId: getSessionId(),
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to reach support assistant')
  }

  const data = (await response.json()) as ChatResponse
  return data.message ?? 'Sorry, no response was returned.'
}
