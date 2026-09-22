import type { Metadata } from 'next';
import SiteFooter from '@/components/layout/site-footer';
import SiteHeader from '@/components/layout/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '大明职官志 · 明朝帝王世系与官职品级',
    template: '%s · 大明职官志',
  },
  description:
    '以图谱与目录双视角梳理明朝 16 帝（含南明 5 帝）世系传承、宗室皇子支系，以及九品十八级官僚品级体系：中央、地方、军事与派驻地方官。',
  keywords: ['明朝', '帝王世系', '官职品级', '九品十八级', '大明', '南明', '科举', '宗室'],
  authors: [{ name: '大明职官志' }],
};

const THEME_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem('ming-theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <SiteHeader />
        <main className="pt-16">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
