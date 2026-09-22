import type { Metadata } from 'next';
import OfficialsExplorer from '@/components/officials/officials-explorer';
import { PageHeader } from '@/components/ui/page-header';
import { getStats, posts, ranks } from '@/lib/data';

export const metadata: Metadata = {
  title: '官职品级',
  description: '明朝九品十八级官僚体系：中央官制、地方行政、军事机构与派驻地方官，含员额、隶属与职事，可按品级或衙门双向浏览。',
};

export default function OfficialsPage() {
  const stats = getStats();
  return (
    <>
      <PageHeader
        eyebrow="职官 · 品级"
        title="官职品级"
        description={`共收录 ${stats.posts} 条官职、${stats.ranks} 档品级、${stats.orgs} 个衙门。明代官制以「品」定尊卑：正从九品十八级为骨架，其上为超品（公侯伯等爵），其下为未入流；另有督抚、镇守等不列品的派驻地方官。可按品级纵览，也可按衙门横向比较。`}
      />
      <OfficialsExplorer posts={posts} ranks={ranks} />
    </>
  );
}
