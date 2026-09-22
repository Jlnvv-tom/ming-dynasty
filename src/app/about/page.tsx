import { FileSpreadsheet, GitBranch, Layers, ShieldQuestion } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHeader, SectionTitle } from '@/components/ui/page-header';
import { getStats, meta } from '@/lib/data';

export const metadata: Metadata = {
  title: '关于数据',
  description: '数据来源、字段口径、目录结构与校正方式说明。',
};

const PIPELINE = [
  { icon: FileSpreadsheet, title: '原始表格', desc: 'data/raw 下的 Excel，含帝王正朔、子嗣、官职三大主表与散阶、勋级、科举、字辈等附表。' },
  { icon: Layers, title: 'ETL 抽取', desc: 'scripts/etl 解析合并单元格、归并衙门、推导关系边，输出 src/data 下的结构化 JSON。' },
  { icon: ShieldQuestion, title: '一致性校验', desc: 'pnpm data:check 校验关系边悬空引用、品级可解析性、在位区间与序位连续性。' },
  { icon: GitBranch, title: '静态导出', desc: 'Next.js 全静态导出，页面在构建期预渲染，可直接托管到任意静态服务器。' },
];

const NOTES = [
  '英宗朱祁镇在原始表中分作「英宗（正统）」与「复帝（天顺）」两行，本站合并为一位帝王、两个年号。',
  '「尚宝司」在源表中同时登记于中央与地方两处，已按中央归属去重。',
  '世宗朱厚熜、惠帝朱允炆、安宗朱由崧、昭宗朱由榔之父为宗室亲王（朱祐杬、朱标、朱常洵、朱常瀛），图中以宗室节点连接。',
  '武散阶在源表止于从六品，与文散阶十八阶不同，这是明代制度本身的特点，非遗漏。',
  '个别皇子名讳含生僻造字，按原表字符保留。',
];

export default function AboutPage() {
  const stats = getStats();

  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="关于"
        title="关于数据"
        description="本站是对一份史料表格的结构化重编。所有内容均从原始表格抽取，未作史实增补；如发现异文或错漏，欢迎按下方流程校正。"
      />

      <div className="mx-auto max-w-7xl px-4">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['帝王', stats.emperors],
            ['宗室皇子', stats.princes],
            ['官职', stats.posts],
            ['关系边', stats.relations ?? 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="surface px-4 py-4">
              <p className="text-2xl font-semibold text-vermilion dark:text-vermilion-soft">{value}</p>
              <p className="mt-0.5 text-xs text-ink-soft dark:text-white/60">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <SectionTitle title="数据流水线" hint="从原始表格到静态站点的一条单向链路" />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((item) => (
              <div key={item.title} className="surface p-5">
                <item.icon className="h-5 w-5 text-dai dark:text-dai-soft" />
                <h3 className="mt-3 font-serif text-base font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft dark:text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionTitle title="口径与校勘说明" hint="理解数据时需要先知道这几条" />
          <div className="surface p-5">
            <ul className="space-y-2 text-sm leading-relaxed text-ink-soft dark:text-white/65">
              {NOTES.map((note) => (
                <li key={note} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-10">
          <SectionTitle title="如何校正数据" hint="改表格 → 重跑脚本 → 提交" />
          <div className="surface p-5 text-sm leading-relaxed text-ink-soft dark:text-white/65">
            <ol className="list-decimal space-y-2 pl-5">
              <li>修改 data/raw 下的原始表格（保持表头与列序不变）。</li>
              <li>运行 pnpm data:import 重新生成 src/data 下的 JSON。</li>
              <li>运行 pnpm data:check 确认无悬空引用与无法解析的品级。</li>
              <li>运行 pnpm build 产出静态站点到 out/。</li>
            </ol>
          </div>
        </section>

        <p className="mt-10 text-xs text-ink-faint dark:text-white/40">
          数据源：{meta.source} · 生成时间：{new Date(meta.generatedAt).toLocaleString('zh-CN')}
        </p>
      </div>
    </div>
  );
}
