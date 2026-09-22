import type { Metadata } from 'next';
import GraphClient from '@/components/graph/graph-client';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: '关系图谱',
  description:
    '明代帝王世系与官僚体系的分层图谱：世系按八个历史分期展开，官制按「体系 → 衙门 → 官职」三级下钻，每层控制在可读的节点规模内。',
};

export default function GraphPage() {
  return (
    <>
      <PageHeader
        eyebrow="图谱 · 交互"
        title="关系图谱"
        description="世系不是一条直线：叔夺侄位、兄终弟及、夺门复辟，都藏在关系边里。为避免把五百余条官职塞进一张图，这里改为「分类入口 + 逐层下钻」——世系按八个历史分期分图，官制按体系、衙门、官职三级展开，每一层都保持可读。"
      />
      <GraphClient />
    </>
  );
}
