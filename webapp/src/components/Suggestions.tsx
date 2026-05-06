type SuggestionsProps = {
  items: string[]
  onSelect: (value: string) => void
}

export function Suggestions({ items, onSelect }: SuggestionsProps) {
  return (
    <div id="suggestions" className="suggestions">
      {items.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          className="suggestion-btn"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
