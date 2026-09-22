import type { Metadata } from 'next';
import EmperorExplorer from '@/components/emperor/emperor-explorer';
import { PageHeader } from '@/components/ui/page-header';
import { emperors, getStats, princes, relations } from '@/lib/data';

export const metadata: Metadata = {
  title: '帝王世系',
  description: '明朝 16 帝（含南明 5 帝）的庙号、名讳、年号、谥号与在位始末，并可切换卡片、时间轴与继统链三种视图。',
};

export default function EmperorsPage() {
  const stats = getStats();
  return (
    <>
      <PageHeader
        eyebrow="世系 · 继统"
        title="帝王世系"
        description={`自太祖朱元璋洪武开国，至思宗朱由检崇祯殉国，大明共 ${stats.mingEmperors} 帝；其后南明 ${stats.nanmingEmperors} 帝延续正朔。这里可切换卡片、时间轴与继统链三种视角，看清每一次皇位传承的性质——父子相承、兄终弟及，乃至叔夺侄位与夺门复辟。`}
      />
      <EmperorExplorer emperors={emperors} princes={princes} relations={relations} />
    </>
  );
}
