import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function getBreakpoint(width: number): Breakpoint {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() => getBreakpoint(window.innerWidth));

  useEffect(() => {
    const mql640 = window.matchMedia('(max-width: 639px)');
    const mql1024 = window.matchMedia('(max-width: 1023px)');

    function update() {
      setBp(getBreakpoint(window.innerWidth));
    }

    mql640.addEventListener('change', update);
    mql1024.addEventListener('change', update);
    window.addEventListener('resize', update);

    return () => {
      mql640.removeEventListener('change', update);
      mql1024.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return bp;
}

export function useIsMobile(): boolean {
  return useBreakpoint() === 'mobile';
}

export function useIsTablet(): boolean {
  return useBreakpoint() === 'tablet';
}

export function useIsDesktop(): boolean {
  return useBreakpoint() === 'desktop';
}
