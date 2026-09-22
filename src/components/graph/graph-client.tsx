'use client';

import { useEffect, useState } from 'react';
import GraphExplorer from './graph-explorer';

interface FocusParams {
  focusId?: string;
  focusPost?: string;
}

/**
 * 静态导出下不直接使用 useSearchParams（会导致整页回退到 loading），
 * 改为挂载后读取查询串，让工具栏与信息面板参与服务端预渲染。
 */
export default function GraphClient() {
  const [params, setParams] = useState<FocusParams>({});

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setParams({
      focusId: query.get('focus') ?? undefined,
      focusPost: query.get('post') ?? undefined,
    });
  }, []);

  return <GraphExplorer focusId={params.focusId} focusPost={params.focusPost} />;
}
