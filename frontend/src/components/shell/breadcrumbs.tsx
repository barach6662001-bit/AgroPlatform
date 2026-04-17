import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { resolveBreadcrumbs } from '@/lib/breadcrumb-registry'
import { navigation } from '@/lib/navigation'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const chain = resolveBreadcrumbs(pathname)

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {chain.map((seg, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-fg-tertiary" />}
          {seg.href ? (
            <BreadcrumbLink href={seg.href} label={seg.label} />
          ) : (
            <span className="text-fg-primary font-medium">{seg.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

function BreadcrumbLink({ href, label }: { href: string; label: string }) {
  const siblings = findSiblings(href)
  const linkClass = 'text-fg-secondary hover:text-fg-primary transition-colors'

  if (siblings.length <= 1) {
    return <Link to={href} className={linkClass}>{label}</Link>
  }

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link to={href} className={linkClass}>{label}</Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-56 p-1" align="start">
        <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-fg-tertiary">
          {label}
        </div>
        {siblings.map((sib) => (
          <Link
            key={sib.href}
            to={sib.href}
            className="flex items-center rounded px-2 py-1.5 text-sm text-fg-secondary hover:bg-bg-muted hover:text-fg-primary"
          >
            {sib.label}
          </Link>
        ))}
      </HoverCardContent>
    </HoverCard>
  )
}

function findSiblings(href: string) {
  for (const group of navigation) {
    for (const item of group.items) {
      if (item.href === href) {
        return [item, ...group.items.filter((i) => i.href !== href)]
          .map((i) => ({ href: i.href, label: i.label }))
      }
      if (item.children) {
        const match = item.children.find((c) => c.href === href)
        if (match) {
          return item.children.map((c) => ({ href: c.href, label: c.label }))
        }
      }
    }
  }
  return []
}
