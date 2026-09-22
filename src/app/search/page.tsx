import type { Metadata } from 'next';
import SearchView from '@/components/search/search-view';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: '全局检索',
  description: '跨帝王、皇子、官职、科举与皇室字辈的即时检索。',
};

export default function SearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="检索"
        title="全局检索"
        description="一次输入，跨帝王、宗室皇子、官职、科举与皇室字辈五类数据检索。支持空格分隔的多关键词（需同时命中）。"
      />
      <SearchView />
    </>
  );
}
