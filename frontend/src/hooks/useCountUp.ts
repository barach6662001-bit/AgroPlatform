import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setValue(target * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

export const fmt = {
  currency: (v: number, currency = '₴') => {
    if (v >= 1_000_000) return `${currency}${(v / 1_000_000).toFixed(2)}M`
    if (v >= 1_000) return `${currency}${(v / 1_000).toFixed(1)}K`
    return `${currency}${v.toFixed(0)}`
  },
  percent: (v: number, decimals = 1) => `${v.toFixed(decimals)}%`,
  number: (v: number) => new Intl.NumberFormat('uk-UA').format(Math.round(v)),
  decimal: (v: number, decimals = 2) => v.toFixed(decimals),
}
