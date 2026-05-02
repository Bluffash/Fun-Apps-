import { ExternalLink } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

interface NewsCardProps {
  article: {
    headline: string
    description: string
    published: string
    image: string | null
    url: string | null
    tag: string | null
  }
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <a
      href={article.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group"
    >
      {article.image && (
        <img
          src={article.image}
          alt=""
          className="w-20 h-16 object-cover rounded-md shrink-0"
        />
      )}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary">
            {article.headline}
          </h3>
          <ExternalLink className="w-3 h-3 shrink-0 text-muted-foreground mt-0.5" />
        </div>
        {article.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{article.description}</p>
        )}
        <div className="flex items-center gap-2">
          {article.tag && (
            <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">{article.tag}</span>
          )}
          <span className="text-xs text-muted-foreground">{timeAgo(article.published)}</span>
        </div>
      </div>
    </a>
  )
}
