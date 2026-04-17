import { navigation } from './navigation'

export interface BreadcrumbSegment {
  label: string
  href?: string
}

const labelByPath = new Map<string, string>()
navigation.forEach((group) => {
  group.items.forEach((item) => {
    labelByPath.set(item.href, item.label)
    item.children?.forEach((child) => {
      labelByPath.set(child.href, child.label)
    })
  })
})

export function resolveBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean)
  const chain: BreadcrumbSegment[] = [{ label: 'Home', href: '/dashboard' }]

  let accumulated = ''
  segments.forEach((seg, i) => {
    accumulated += '/' + seg
    const label = labelByPath.get(accumulated) ?? prettify(seg)
    const isLast = i === segments.length - 1
    chain.push({ label, href: isLast ? undefined : accumulated })
  })

  return chain
}

function prettify(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
