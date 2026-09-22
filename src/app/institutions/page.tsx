import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHeader, SectionTitle } from '@/components/ui/page-header';
import { institutions } from '@/lib/data';

export const metadata: Metadata = {
  title: '制度附录',
  description: '明代宗室封爵序列、文武散阶、勋级、科举取士层级与皇室字辈——理解身份秩序的几条暗线。',
};

function Anchor({ id, title, hint }: { id: string; title: string; hint: string }) {
  return (
    <div className="pt-6" id={id}>
      <SectionTitle title={title} hint={hint} />
    </div>
  );
}

export default function InstitutionsPage() {
  const { titles, civilGrades, militaryGrades, civilMerits, militaryMerits, exams, poems } = institutions;

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="典章 · 制度"
        title="制度附录"
        description="封爵决定宗室的身份序列，散阶与勋级决定官员的荣誉位阶，科举决定入仕的通道，字辈则决定了宗室支系的命名秩序。它们共同构成明代身份社会的骨架。"
      />

      <div className="mx-auto max-w-7xl px-4">
        {/* 宗室封爵 */}
        <Anchor id="jue" title="宗室封爵" hint="皇子与皇女的爵位序列，自亲王、公主递降至奉国中尉、乡君" />
        <div className="space-y-4">
          {titles.map((item) => (
            <div key={item.label} className="surface p-5">
              <h3 className="font-serif text-base font-semibold">{item.label}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.chain.map((node, index) => (
                  <span key={`${node}-${index}`} className="flex items-center gap-2">
                    <span className="rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 text-sm">
                      {node}
                    </span>
                    {index < item.chain.length - 1 ? (
                      <ArrowRight className="h-3.5 w-3.5 text-ink-faint" />
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 文武散阶 */}
        <Anchor id="san" title="文武散阶" hint="散阶为荣誉品位：初授、升授、加授三级递进，与实际职事分离" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { key: '文散阶', rows: civilGrades },
            { key: '武散阶', rows: militaryGrades },
          ].map((block) => (
            <div key={block.key} className="surface overflow-hidden">
              <div className="border-b border-ink/10 px-5 py-3 dark:border-white/10">
                <h3 className="font-serif text-base font-semibold">{block.key}</h3>
                <p className="mt-0.5 text-xs text-ink-faint dark:text-white/45">共 {block.rows.length} 阶</p>
              </div>
              <div className="max-h-[520px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-paper-soft/95 backdrop-blur dark:bg-night-soft/95">
                    <tr className="text-left text-xs text-ink-faint dark:text-white/45">
                      <th className="px-5 py-2 font-normal">品级</th>
                      <th className="px-3 py-2 font-normal">初授</th>
                      <th className="px-3 py-2 font-normal">升授</th>
                      <th className="px-5 py-2 font-normal">加授</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row) => (
                      <tr key={row.rankLabel} className="border-t border-ink/5 dark:border-white/5">
                        <td className="whitespace-nowrap px-5 py-2 font-serif text-vermilion dark:text-vermilion-soft">
                          {row.rankLabel}
                        </td>
                        <td className="px-3 py-2">{row.initial ?? '—'}</td>
                        <td className="px-3 py-2">{row.promote ?? '—'}</td>
                        <td className="px-5 py-2">{row.add ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* 勋级 */}
        <Anchor id="xun" title="勋级" hint="文勋十级、武勋十二级，与散阶同为荣誉序列，按品级授予" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { key: '文勋十级', rows: civilMerits },
            { key: '武勋十二级', rows: militaryMerits },
          ].map((block) => (
            <div key={block.key} className="surface p-5">
              <h3 className="font-serif text-base font-semibold">{block.key}</h3>
              <ul className="mt-3 space-y-1.5">
                {block.rows.map((row) => (
                  <li key={row.rankLabel} className="flex items-baseline gap-3 text-sm">
                    <span className="w-14 shrink-0 font-serif text-xs text-dai dark:text-dai-soft">
                      {row.rankLabel}
                    </span>
                    <span>{row.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 科举 */}
        <Anchor id="keju" title="科举取士" hint="童试 → 乡试 → 会试 → 殿试：从童生到进士的四级阶梯" />
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <div key={exam.id} className="surface p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-lg font-semibold">{exam.name}</h3>
                <span className="chip text-[11px]">第 {exam.order} 级</span>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex gap-3">
                  <dt className="w-14 shrink-0 text-xs text-ink-faint dark:text-white/45">地点</dt>
                  <dd className="flex-1 leading-relaxed">{exam.place || '—'}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-14 shrink-0 text-xs text-ink-faint dark:text-white/45">时间</dt>
                  <dd className="flex-1 leading-relaxed">{exam.time || '—'}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-14 shrink-0 text-xs text-ink-faint dark:text-white/45">出身</dt>
                  <dd className="flex-1 leading-relaxed text-vermilion dark:text-vermilion-soft">
                    {exam.grade || '—'}
                  </dd>
                </div>
              </dl>

              {exam.steps?.length ? (
                <div className="mt-4">
                  <p className="label-key mb-2">子阶段</p>
                  <ol className="space-y-2">
                    {exam.steps.map((step) => (
                      <li key={step.name} className="rounded-lg border border-ink/10 p-3 text-xs dark:border-white/10">
                        <p className="font-serif text-sm">{step.name}</p>
                        <p className="mt-1 text-ink-soft dark:text-white/60">{step.place}</p>
                        <p className="mt-0.5 text-ink-faint dark:text-white/45">{step.time}</p>
                        {step.outcome ? (
                          <p className="mt-1 text-jade">{step.outcome}</p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="mt-4">
                <p className="label-key mb-2">结果与出路</p>
                <ul className="space-y-1 text-xs leading-relaxed text-ink-soft dark:text-white/60">
                  {exam.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* 皇室字辈 */}
        <Anchor id="zibei" title="皇室字辈" hint="太祖为各王房拟定二十字，依辈分取名，用以别昭穆、序长幼" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {poems.map((item) => (
            <div key={item.house} className="surface p-4">
              <h3 className="font-serif text-base font-semibold text-dai dark:text-dai-soft">{item.house}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-white/60">{item.poem}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
