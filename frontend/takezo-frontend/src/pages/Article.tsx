import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Odpowiedz agenta to artykul, nie dymek: pelna szerokosc kolumny czytania,
// szeryfowy krój i prawdziwy Markdown - naglowki, listy, kod, tabele.
export function Article({ content }: { content: string }) {
  return (
    <div className="article">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
