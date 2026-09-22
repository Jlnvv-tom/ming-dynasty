import Link from 'next/link';
import AuthorDialog from '@/components/layout/author-dialog';

const LINKS = [
  { href: '/emperors/', label: '帝王世系' },
  { href: '/officials/', label: '官职品级' },
  { href: '/graph/', label: '关系图谱' },
  { href: '/institutions/', label: '制度附录' },
  { href: '/search/', label: '全局检索' },
  { href: '/about/', label: '关于数据' },
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/10 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <span className="seal">明</span>
              <span className="font-serif text-base font-semibold tracking-[0.18em]">大明职官志</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-white/60">
              以「明朝帝王世系 &amp; 官职品级」原始资料为底本，重编为可检索、可图谱化的知识站。
              史料以《明史》《明会典》等通行记载为准，个别异文已在页面标注。
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-soft transition-colors hover:text-vermilion dark:text-white/60 dark:hover:text-vermilion-soft"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="gold-rule my-6" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-faint dark:text-white/40">
            {/* 数据来源：工作区 data/raw 原始表格 · 本站为静态站点，内容仅供学习与研究参考 */}
          </p>
          <AuthorDialog />
        </div>
      </div>
    </footer>
  );
}
