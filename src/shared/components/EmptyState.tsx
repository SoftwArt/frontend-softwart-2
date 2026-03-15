

import { InboxIcon } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <InboxIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
