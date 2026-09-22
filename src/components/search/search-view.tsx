'use client';

import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { SearchDoc } from '@/types/index';

const TYPE_LABEL: Record<SearchDoc['type'], string> = {
  emperor: '帝王',
  prince: '皇子',
  post: '官职',
  exam: '科举',
  poem: '字辈',
};

const TYPE_TONE: Record<SearchDoc['type'], string> = {
  emperor: 'text-vermilion dark:text-vermilion-soft',
  prince: 'text-clay',
  post: 'text-dai dark:text-dai-soft',
  exam: 'text-jade',
  poem: 'text-ink-faint dark:text-white/45',
};

const QUICK = ['永乐', '内阁', '正三品', '锦衣卫', '巡抚', '殿试', '朱棣'];

export default function SearchView() {
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let alive = true;
    fetch('/search-index.json')
      .then((res) => res.json())
      .then((data: SearchDoc[]) => {
        if (alive) setDocs(data);
      })
      .catch((error) => {
        console.error('检索索引加载失败', error);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo(() => {
    const terms = keyword.trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return docs.filter((doc) => {
      const haystack = `${doc.title} ${doc.subtitle} ${doc.text}`;
      return terms.every((term) => haystack.includes(term));
    });
  }, [docs, keyword]);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10">
      <div className="surface p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
          <input
            autoFocus
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="输入关键词，如「永乐」「内阁」「正三品」「锦衣卫」"
            className="w-full rounded-full border border-ink/15 bg-transparent py-3 pl-12 pr-4 text-base outline-none transition-colors placeholder:text-ink-faint focus:border-vermilion/60 dark:border-white/15"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setKeyword(item)}
              className="chip text-[11px] transition-colors hover:border-vermilion/50 hover:text-vermilion"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-ink-faint">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在载入检索索引…
          </p>
        ) : null}

        {!loading && keyword.trim() ? (
          <p className="text-sm text-ink-faint dark:text-white/45">
            命中 {results.length} 条 · 索引共 {docs.length} 条
          </p>
        ) : null}

        <ul className="mt-3 space-y-2">
          {results.slice(0, 60).map((doc) => (
            <li key={`${doc.type}-${doc.id}`}>
              <Link href={doc.url} className="surface surface-hover block p-4">
                <div className="flex items-baseline gap-3">
                  <span className={`shrink-0 text-xs ${TYPE_TONE[doc.type]}`}>{TYPE_LABEL[doc.type]}</span>
                  <h3 className="font-serif text-base font-semibold">{doc.title}</h3>
                  <span className="ml-auto truncate text-xs text-ink-faint dark:text-white/45">{doc.subtitle}</span>
                </div>
                {doc.text ? (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft dark:text-white/55">
                    {doc.text}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        {!loading && keyword.trim() && !results.length ? (
          <p className="surface p-10 text-center text-sm text-ink-faint dark:text-white/45">
            没有匹配的条目，试试更短的关键词
          </p>
        ) : null}

        {!keyword.trim() ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/emperors/" className="surface surface-hover p-5">
              <h3 className="font-serif text-base font-semibold">按帝王浏览</h3>
              <p className="mt-1 text-xs text-ink-faint dark:text-white/45">21 位帝王 · 107 位皇子</p>
            </Link>
            <Link href="/officials/" className="surface surface-hover p-5">
              <h3 className="font-serif text-base font-semibold">按官职浏览</h3>
              <p className="mt-1 text-xs text-ink-faint dark:text-white/45">548 条官职 · 21 档品级</p>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
