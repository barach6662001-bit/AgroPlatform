import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import changelog from '@/data/changelog.json'

const SEEN_KEY = 'changelog-seen-ids'

export function useUnreadChangelog() {
  const [unread, setUnread] = useState(0)
  useEffect(() => {
    const seen = new Set<string>(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]'))
    setUnread(changelog.filter((e) => !seen.has(e.id)).length)
  }, [])
  return unread
}

export function WhatsNewDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  useEffect(() => {
    if (!open) return
    const ids = changelog.map((e) => e.id)
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids))
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>What's new</DialogTitle>
          <DialogDescription>Recent updates to AgroPlatform</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {changelog.map((entry) => (
            <div key={entry.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-[10px]">
                  {entry.category}
                </Badge>
                <span className="text-xs text-fg-tertiary">{entry.date}</span>
              </div>
              <h3 className="font-medium text-sm">{entry.title}</h3>
              <p className="text-sm text-fg-secondary">{entry.body}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
