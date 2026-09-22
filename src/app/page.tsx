import { Crown, GraduationCap, Landmark, Network, ScrollText, Users } from 'lucide-react';
import Link from 'next/link';
import { EmperorCard } from '@/components/emperor/emperor-card';
import { SectionTitle } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { getEmperors, getStats, institutions, posts, ranks } from '@/lib/data';

const ENTRANCES = [
  {
    href: '/emperors/',
    icon: Crown,
    title: '帝王世系',
    desc: '太祖开国至思宗殉国，兼收南明五帝。庙号、名讳、年号、谥号与在位始末一览，并列出各帝皇子支系。',
    meta: '21 位帝王 · 107 位皇子',
  },
  {
    href: '/officials/',
    icon: Landmark,
    title: '官职品级',
    desc: '九品十八级官僚体系：中央、地方、军事与派驻地方官，含员额、隶属与职事。可按品级或衙门双向浏览。',
    meta: '548 条官职 · 21 档品级',
  },
  {
    href: '/graph/',
    icon: Network,
    title: '关系图谱',
    desc: '世系传承与官僚拓扑的交互式图谱：切换布局、过滤关系类型、高亮祖孙路径，并与目录双向联动。',
    meta: '132 条关系边',
  },
];

const INSTITUTION_LINKS = [
  { href: '/institutions/#jue', icon: Users, label: '宗室封爵', hint: '皇子八等 · 皇女七等' },
  { href: '/institutions/#san', icon: ScrollText, label: '文武散阶', hint: '文 18 阶 · 武 12 阶' },
  { href: '/institutions/#xun', icon: GraduationCap, label: '勋级', hint: '文勋十级 · 武勋十二级' },
  { href: '/institutions/#keju', icon: GraduationCap, label: '科举取士', hint: '童试 → 乡试 → 会试 → 殿试' },
];

export default function HomePage() {
  const stats = getStats();
  const ming = getEmperors('ming');
  const regularRanks = ranks.filter((r) => r.level > 0);
  const specialRanks = ranks.filter((r) => r.level === 0);

  return (
    <div className="pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-10">
          <div className="surface relative overflow-hidden p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-vermilion/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-dai/10 blur-3xl" />

            <div className="relative max-w-3xl">
              <p className="label-key">大明 · 1368 — 1644</p>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                大明职官志
                <span className="mt-2 block text-xl text-ink-soft sm:text-2xl dark:text-white/65">
                  帝王世系 &amp; 官职品级 · 可读、可查、可图谱
                </span>
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-ink-soft sm:text-base dark:text-white/65">
                把一份平面的史料表格，重编为有结构的知识站：沿继统链看清十六帝的传承与变局，
                顺九品十八级摸清从内阁大学士到未入流大使的官僚网络，再用交互式图谱把血缘与品级两套体系连起来。
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/emperors/"
                  className="rounded-full bg-vermilion px-5 py-2.5 text-sm text-paper-soft shadow-card transition-transform hover:-translate-y-0.5 hover:bg-vermilion-light"
                >
                  浏览帝王世系
                </Link>
                <Link
                  href="/officials/"
                  className="rounded-full border border-dai/40 px-5 py-2.5 text-sm text-dai transition-colors hover:bg-dai/10 dark:border-dai-light/50 dark:text-dai-soft"
                >
                  查阅官职品级
                </Link>
                <Link
                  href="/graph/"
                  className="rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink-soft transition-colors hover:border-gold hover:text-ink dark:border-white/20 dark:text-white/70"
                >
                  打开关系图谱
                </Link>
              </div>
            </div>

            <div className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="帝王" value={stats.emperors} hint={`大明 ${stats.mingEmperors} · 南明 ${stats.nanmingEmperors}`} />
              <StatCard label="在位合计" value={`${stats.reignYears} 年`} hint="大明诸帝累计" />
              <StatCard label="宗室皇子" value={stats.princes} hint="各帝子嗣" />
              <StatCard label="官职" value={stats.posts} hint="四大体系" />
              <StatCard label="品级" value={stats.ranks} hint="正从九品 · 未入流" />
              <StatCard label="衙门" value={stats.orgs} hint="机构分组" />
            </div>
          </div>
        </div>
      </section>

      {/* 三大入口 */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {ENTRANCES.map((item) => (
            <Link key={item.href} href={item.href} className="surface surface-hover group p-6">
              <item.icon className="h-6 w-6 text-vermilion dark:text-vermilion-soft" />
              <h3 className="mt-4 font-serif text-lg font-semibold group-hover:text-vermilion dark:group-hover:text-vermilion-soft">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-white/60">{item.desc}</p>
              <p className="mt-4 text-xs text-ink-faint dark:text-white/45">{item.meta}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 帝王速览 */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionTitle
          title="大明十六帝"
          hint="点击任意帝王进入档案页，可查看亲属关系、年号沿革与在世系中的位置"
          action={
            <Link href="/emperors/" className="text-sm text-vermilion hover:underline dark:text-vermilion-soft">
              查看全部 →
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ming.map((emperor) => (
            <EmperorCard key={emperor.id} emperor={emperor} />
          ))}
        </div>
      </section>

      {/* 品级阶梯 */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionTitle
          title="九品十八级"
          hint="品级是明代官僚的骨架：正从九品共十八级，另有超品、未入流与无品级"
          action={
            <Link href="/officials/" className="text-sm text-vermilion hover:underline dark:text-vermilion-soft">
              按品级浏览 →
            </Link>
          }
        />
        <div className="surface p-5">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
            {regularRanks.map((rank) => {
              const count = posts.filter((p) => p.rankLabel === rank.label).length;
              return (
                <Link
                  key={rank.key}
                  href={`/officials/?rank=${encodeURIComponent(rank.label)}`}
                  className="rounded-lg border border-ink/10 px-2 py-3 text-center transition-colors hover:border-vermilion/50 hover:bg-vermilion/5 dark:border-white/10"
                >
                  <p className="font-serif text-sm">{rank.label}</p>
                  <p className="mt-1 text-xs text-ink-faint dark:text-white/45">{count} 职</p>
                </Link>
              );
            })}
          </div>
          <div className="gold-rule my-4" />
          <div className="flex flex-wrap gap-2">
            {specialRanks.map((rank) => {
              const count = posts.filter((p) => p.rankLabel === rank.label).length;
              return (
                <Link
                  key={rank.key}
                  href={`/officials/?rank=${encodeURIComponent(rank.label)}`}
                  className="chip transition-colors hover:border-vermilion/50 hover:text-vermilion"
                >
                  {rank.label} · {count} 职
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 制度附录 */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionTitle
          title="制度附录"
          hint="封爵、散阶、勋级、科举与皇室字辈——理解明代身份秩序的几条暗线"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INSTITUTION_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="surface surface-hover group p-5">
              <item.icon className="h-5 w-5 text-dai dark:text-dai-soft" />
              <h3 className="mt-3 font-serif text-base font-semibold group-hover:text-vermilion dark:group-hover:text-vermilion-soft">
                {item.label}
              </h3>
              <p className="mt-1 text-xs text-ink-faint dark:text-white/45">{item.hint}</p>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-faint dark:text-white/40">
          收录皇室字辈 {institutions.poems.length} 房 · 科举阶段 {institutions.exams.length} 级
        </p>
      </section>
    </div>
  );
}
