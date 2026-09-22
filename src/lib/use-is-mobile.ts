'use client';

import { useEffect, useState } from 'react';

/** 视口宽度小于 768px 视为小屏（图谱据此决定是否降级为列表） */
export function useIsMobile(breakpoint = 768): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const update = () => setMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakpoint]);

  return mobile;
}
